from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm
from . import auth 
from . import models, schemas, database
from datetime import timedelta
import shutil
import os
from fastapi import UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi import BackgroundTasks # <--- Importante
from . import worker # Importamos nuestro nuevo módulo


# Configuración de hashing de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Crear las tablas en la base de datos (si no existen)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="DocFlow Serverless API",
    version="1.0.0"
)

origins = [
    "http://localhost:5173", # Puerto por defecto de Vite
    "http://localhost:3000", # Puerto alternativo común
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Utilidad para hashear contraseñas
def get_password_hash(password):
    return pwd_context.hash(password)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a DocFlow API", "status": "active"}

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    # 1. Verificar si el email ya existe
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # 2. Hashear la contraseña y crear el usuario
    hashed_password = get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    
    # 3. Guardar en DB
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@app.post("/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    # 1. Buscar usuario
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    # 2. Verificar password
    if not user or not auth.pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Generar token JWT
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    """
    Endpoint protegido: Solo accesible si envías un token válido.
    Devuelve la información del usuario logueado.
    """
    return current_user

#CARGA DE ARCHIVOS

@app.post("/files/upload", response_model=schemas.FileResponse)
def upload_file(
    background_tasks: BackgroundTasks, # <--- Inyectamos BackgroundTasks
    file: UploadFile = File(...), 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # 1. Validar el archivo (Opcional: rechazar si no es PDF o imagen)
    # Por ahora aceptamos todo para probar.

    # 2. Definir ruta de almacenamiento (Simulación de S3)
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generamos un nombre único o usamos el original con prefijo de usuario para evitar colisiones
    file_location = f"{upload_dir}/{current_user.id}_{file.filename}"
    
    # 3. Guardar el contenido físico
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # 4. Guardar metadatos en Base de Datos
    # Obtenemos el tamaño del archivo (moviendo el cursor al final y volviendo)
    file.file.seek(0, 2)
    file_size = file.file.tell()
    
    new_file = models.File(
        filename=file.filename,
        location=file_location,
        content_type=file.content_type,
        size=file_size,
        owner_id=current_user.id
    )
    
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    new_file = models.File(
        filename=file.filename,
        location=file_location,
        content_type=file.content_type,
        size=file_size,
        owner_id=current_user.id,
        status="pending" # Estado inicial
    )
    
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    
    # --- AQUÍ LA MAGIA ---
    # Disparamos la tarea en segundo plano
    # Creamos una nueva sesión para el worker porque la 'db' actual se cerrará al retornar
    db_worker = database.SessionLocal() 
    background_tasks.add_task(worker.process_file_background, new_file.id, file_location, db_worker)
    
    return new_file

@app.get("/files/", response_model=list[schemas.FileResponse])
def get_my_files(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return db.query(models.File).filter(models.File.owner_id == current_user.id).all()

