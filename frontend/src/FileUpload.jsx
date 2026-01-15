import { useState } from 'react';
import axios from 'axios';

function FileUpload({ token, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:8000/files/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Archivo subido. El procesamiento ha iniciado en segundo plano.');
      setFile(null);
      // Avisamos al padre (App) para que refresque la lista
      if (onUploadSuccess) onUploadSuccess(); 
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ border: '1px dashed #ccc', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
      <h3>📂 Subir Nuevo Documento</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" />
        <button 
          type="submit" 
          disabled={!file || uploading}
          style={{ 
            padding: '8px 16px', 
            background: uploading ? '#ccc' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Subiendo...' : 'Procesar en Nube'}
        </button>
      </form>
    </div>
  );
}

export default FileUpload;