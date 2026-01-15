from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base
from sqlalchemy import Text

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    
    # Relación inversa: Un usuario tiene muchos archivos
    files = relationship("File", back_populates="owner")

class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    location = Column(String) # Ruta local o URL de S3
    content_type = Column(String) # ej: application/pdf
    size = Column(Integer) # en bytes
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    extracted_text = Column(Text, nullable=True) # Aquí guardaremos lo que lea del PDF
    
    # Clave foránea: Cada archivo pertenece a un usuario
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="files")