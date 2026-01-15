import { useState } from 'react'
import axios from 'axios'
import FileUpload from './FileUpload' // <--- Importar
import FileList from './FileList'     // <--- Importar

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(null)
  const [refreshList, setRefreshList] = useState(false) // Trigger para refrescar lista

  const handleLogin = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    try {
      const response = await axios.post('http://localhost:8000/login', formData)
      setToken(response.data.access_token)
    } catch (err) {
      alert('Credenciales incorrectas')
    }
  }

  // Función para forzar la recarga de la lista cuando se sube un archivo
  const triggerRefresh = () => {
    setRefreshList(prev => !prev)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', fontFamily: 'Arial' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#333' }}>🚀 DocFlow Serverless</h1>
        {token && (
          <button onClick={() => setToken(null)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>
            Cerrar Sesión
          </button>
        )}
      </header>
      
      {!token ? (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px' }}/>
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px' }}/>
            <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Ingresar</button>
          </form>
        </div>
      ) : (
        <div>
          {/* Componente de Subida */}
          <FileUpload token={token} onUploadSuccess={triggerRefresh} />
          
          {/* Componente de Lista */}
          <FileList token={token} refreshTrigger={refreshList} />
        </div>
      )}
    </div>
  )
}

export default App