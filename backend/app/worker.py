import time
from sqlalchemy.orm import Session
from . import models
from pypdf import PdfReader

def process_file_background(file_id: int, file_path: str, db: Session):
    """
    Simula una función AWS Lambda.
    Lee el archivo, extrae texto y actualiza la DB.
    """
    print(f"⚡ [WORKER] Iniciando procesamiento del archivo ID: {file_id}")
    
    # 1. Buscar el archivo en DB
    file_record = db.query(models.File).filter(models.File.id == file_id).first()
    if not file_record:
        return

    # 2. Cambiar estado a PROCESSING
    file_record.status = "processing"
    db.commit()

    try:
        # Simular delay de análisis complejo (ej. IA o OCR pesado)
        time.sleep(5) 
        
        # 3. Lógica de Extracción (ETL)
        text_content = ""
        
        # Solo intentamos leer si es PDF
        if file_path.endswith(".pdf"):
            try:
                reader = PdfReader(file_path)
                # Extraer texto de la primera página como demo
                if len(reader.pages) > 0:
                    text_content = reader.pages[0].extract_text()
            except Exception as e:
                text_content = f"Error leyendo PDF: {str(e)}"
        else:
            text_content = "Archivo de imagen o desconocido (No se extrajo texto)."

        # 4. Guardar resultados y marcar COMPLETED
        file_record.extracted_text = text_content
        file_record.status = "completed"
        print(f"✅ [WORKER] Archivo ID {file_id} procesado exitosamente.")

    except Exception as e:
        file_record.status = "failed"
        file_record.extracted_text = str(e)
        print(f"❌ [WORKER] Falló el procesamiento: {e}")

    finally:
        db.commit()
        db.close() # Importante cerrar la sesión en hilos secundarios