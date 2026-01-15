import { useState, useEffect } from 'react';
import axios from 'axios';

function FileList({ token, refreshTrigger }) {
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/files/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(response.data);
    } catch (error) {
      console.error("Error cargando archivos", error);
    }
  };

  // Efecto 1: Cargar al inicio y cuando se sube un archivo nuevo
  useEffect(() => {
    fetchFiles();
  }, [token, refreshTrigger]);

  // Efecto 2: Polling (Consultar cada 3 segundos para actualizar estados)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchFiles();
    }, 3000); // 3000ms = 3 segundos

    // Limpieza al desmontar el componente (evita fugas de memoria)
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div>
      <h3>📑 Mis Documentos Procesados</h3>
      {files.length === 0 ? (
        <p>No tienes archivos aún.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {files.map((file) => (
            <div key={file.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              borderRadius: '8px',
              backgroundColor: file.status === 'completed' ? '#f0fff4' : '#fffaf0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{file.filename}</strong>
                <span style={{ 
                  padding: '4px 8px', 
                  borderRadius: '12px', 
                  fontSize: '0.8em',
                  background: file.status === 'completed' ? '#28a745' : '#ffc107',
                  color: file.status === 'completed' ? 'white' : 'black'
                }}>
                  {file.status.toUpperCase()}
                </span>
              </div>
              
              <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#555' }}>
                {file.status === 'completed' ? (
                  <>
                    <p style={{ fontWeight: 'bold' }}>Texto Extraído (Preview):</p>
                    <p style={{ background: '#eee', padding: '10px', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
                      {file.extracted_text 
                        ? file.extracted_text.substring(0, 200) + (file.extracted_text.length > 200 ? '...' : '') 
                        : 'Sin texto detectado'}
                    </p>
                  </>
                ) : (
                  <p>⏳ Procesando en worker...</p>
                )}
              </div>
              <small style={{ color: '#999' }}>Subido: {new Date(file.created_at).toLocaleString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileList;