from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Importamos la app y la base de datos
from app.main import app
from app.database import Base, get_db

# 1. Configuración de DB en Memoria (SQLite) para Tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}, 
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 2. Creamos las tablas en la DB de prueba
Base.metadata.create_all(bind=engine)

# 3. Override (Sobreescribir) la dependencia get_db
# Esto le dice a FastAPI: "Cuando corras tests, usa esta DB falsa, no la real"
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

# --- INICIO DE LOS TESTS ---

def test_read_main():
    """Prueba que el endpoint raíz responda 200"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Bienvenido a DocFlow API", "status": "active"}

def test_create_user():
    """Prueba el flujo de registro de usuarios"""
    response = client.post(
        "/users/",
        json={"email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "password" not in data # Seguridad: No devolver password

def test_login_user():
    """Prueba que un usuario creado pueda loguearse y recibir token"""
    # Usamos el usuario creado en el test anterior (o lo creamos de nuevo si los tests son aislados)
    # Nota: Pytest corre en orden, pero idealmente cada test debe ser atómico.
    # Para simplicidad aquí, creamos uno nuevo.
    client.post(
        "/users/",
        json={"email": "login@example.com", "password": "password123"},
    )
    
    response = client.post(
        "/login",
        data={"username": "login@example.com", "password": "password123"}, # OAuth2 usa form-data
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"