import { NavLink, useNavigate } from 'react-router-dom'
import { api, borrarSesion } from '../api'

export default function Navbar({ usuario }) {
  const navigate = useNavigate()
  const rol = usuario.rol

  // Cada enlace dice que roles lo pueden ver
  const enlaces = [
    { ruta: '/', texto: 'Inicio', roles: ['ADMIN', 'ALMACENISTA', 'GERENTE'] },
    { ruta: '/productos', texto: 'Productos', roles: ['ADMIN', 'ALMACENISTA', 'GERENTE'] },
    { ruta: '/stock', texto: 'Stock', roles: ['ADMIN', 'ALMACENISTA', 'GERENTE'] },
    { ruta: '/movimientos', texto: 'Movimientos', roles: ['ADMIN', 'ALMACENISTA', 'GERENTE'] },
    { ruta: '/categorias', texto: 'Categorías', roles: ['ADMIN'] },
    { ruta: '/proveedores', texto: 'Proveedores', roles: ['ADMIN'] },
    { ruta: '/bodegas', texto: 'Bodegas', roles: ['ADMIN'] },
    { ruta: '/reportes', texto: 'Reportes', roles: ['ADMIN', 'GERENTE'] },
    { ruta: '/usuarios', texto: 'Usuarios', roles: ['ADMIN'] },
  ]

  async function salir() {
    try {
      await api('/logout/', 'POST')
    } catch (e) {
      // si falla igual se cierra la sesion en el navegador
    }
    borrarSesion()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark barra no-print">
      <div className="container">
        <NavLink className="navbar-brand fw-bold" to="/">Stock<span className="marca">Web</span></NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="menu">
          <ul className="navbar-nav ms-auto">
            {enlaces.filter((e) => e.roles.includes(rol)).map((e) => (
              <li className="nav-item" key={e.ruta}>
                <NavLink className="nav-link" to={e.ruta} end={e.ruta === '/'}>{e.texto}</NavLink>
              </li>
            ))}
            <li className="nav-item">
              <button className="btn nav-link" onClick={salir}>Salir</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
