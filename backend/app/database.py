from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Obtenemos la URL de conexión desde las variables de entorno
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Creamos el motor de conexión
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Creamos una sesión local para interactuar con la DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Clase base para nuestros modelos ORM
Base = declarative_base()

# Dependencia para obtener la sesión de DB en cada request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()