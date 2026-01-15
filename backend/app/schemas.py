from pydantic import BaseModel, EmailStr

# Esquema para recibir datos al crear un usuario (Input)
class UserCreate(BaseModel):
    email: EmailStr
    password: str

# Esquema para devolver datos al cliente (Output)
# Ocultamos la contraseña por seguridad
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True # Permite leer desde el modelo ORM

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

from datetime import datetime

class FileResponse(BaseModel):
    id: int
    filename: str
    content_type: str
    size: int
    created_at: datetime
    location: str
    status: str
    extracted_text: str | None = None

    class Config:
        from_attributes = True