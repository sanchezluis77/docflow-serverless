import { useState } from 'react';
import axios from 'axios';
import { UploadCloud, Loader2 } from 'lucide-react';

function FileUpload({ token, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
      setFile(null);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      alert('Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <UploadCloud className="h-5 w-5 text-blue-500" />
        Subir Documento
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer group">
          <input 
            type="file" 
            onChange={handleFileChange} 
            accept=".pdf,.png,.jpg,.jpeg" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="bg-blue-50 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
              <UploadCloud className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500 font-medium">
              {file ? file.name : "Haz click o arrastra un archivo aquí"}
            </span>
            <span className="text-xs text-gray-400">PDF, PNG, JPG hasta 10MB</span>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!file || uploading}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-all ${
            !file || uploading 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            'Subir a la Nube'
          )}
        </button>
      </form>
    </div>
  );
}

export default FileUpload;