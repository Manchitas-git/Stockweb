import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, guardarSesion, textoError } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function ingresar(e) {
    e.preventDefault()
    try {
      const sesion = await api('/login/', 'POST', { username, password })
      guardarSesion(sesion)
      navigate('/')
    } catch (err) {
      setError(textoError(err))
    }
  }

  return (
    <>
      <nav className="navbar navbar-dark barra">
        <div className="container">
          <span className="navbar-brand fw-bold">Stock<span className="marca">Web</span></span>
        </div>
      </nav>
      <div className="container d-flex justify-content-center mt-5">
        <div className="card tarjeta p-4" style={{ width: 360 }}>
          <h4 className="text-center mb-4">Iniciar sesión</h4>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={ingresar}>
            <input className="form-control mb-3" placeholder="Usuario" value={username}
              onChange={(e) => setUsername(e.target.value)} required />
            <input className="form-control mb-3" type="password" placeholder="Contraseña" value={password}
              onChange={(e) => setPassword(e.target.value)} required />
            <button className="btn btn-primario w-100">Ingresar</button>
          </form>
        </div>
      </div>
    </>
  )
}
