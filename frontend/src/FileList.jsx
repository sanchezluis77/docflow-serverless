import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

function FileList({ token, refreshTrigger }) {
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:8000/files/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ordenar por fecha, el más nuevo primero
      const sorted = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setFiles(sorted);
    } catch (error) {
      console.error("Error cargando archivos", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [token, refreshTrigger]);

  useEffect(() => {
    const interval = setInterval(fetchFiles, 3000);
    return () => clearInterval(interval);
  }, [token]);

  // Función auxiliar para renderizar el badge de estado
  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
    };
    
    const icons = {
      completed: <CheckCircle2 className="h-3 w-3 mr-1" />,
      pending: <Clock className="h-3 w-3 mr-1" />,
      processing: <Clock className="h-3 w-3 mr-1 animate-pulse" />,
      failed: <AlertCircle className="h-3 w-3 mr-1" />,
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        {icons[status]}
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Mis Documentos</h3>
        <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs font-bold">{files.length} Archivos</span>
      </div>

      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {files.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>No has subido ningún archivo aún.</p>
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${file.status === 'completed' ? 'bg-green-50' : 'bg-gray-100'}`}>
                    <FileText className={`h-5 w-5 ${file.status === 'completed' ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{file.filename}</h4>
                    <p className="text-xs text-gray-500">{new Date(file.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {getStatusBadge(file.status)}
              </div>

              {file.status === 'completed' && (
                <div className="mt-3 ml-11">
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Texto Extraído</p>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-200 font-mono leading-relaxed">
                     {file.extracted_text 
                        ? (file.extracted_text.length > 150 ? file.extracted_text.substring(0, 150) + "..." : file.extracted_text)
                        : <span className="italic text-gray-400">Sin texto legible detectado</span>}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default FileList;