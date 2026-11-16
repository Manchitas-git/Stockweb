import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { getSesion } from './api'
import Navbar from './components/Navbar'
import CrudSimple from './components/CrudSimple'
import Login from './pages/Login'
import Inicio from './pages/Inicio'
import Productos from './pages/Productos'
import ProductoForm from './pages/ProductoForm'
import CodigoBarras from './pages/CodigoBarras'
import Movimientos from './pages/Movimientos'
import MovimientoForm from './pages/MovimientoForm'
import Stock from './pages/Stock'
import Reportes from './pages/Reportes'

const ADMIN = ['ADMIN']
const REGISTRA = ['ADMIN', 'ALMACENISTA']
const REPORTES = ['ADMIN', 'GERENTE']

// Solo deja entrar si hay sesion y si el rol tiene permiso para esa pagina
function RutaPrivada({ roles, children }) {
  const sesion = getSesion()
  if (!sesion) return <Navigate to="/login" />
  if (roles && !roles.includes(sesion.usuario.rol)) return <Navigate to="/" />
  return (
    <>
      <Navbar usuario={sesion.usuario} />
      <main className="container py-4">{children}</main>
      <footer className="text-center text-muted small py-4 no-print">
        StockWeb © 2026 — Sistema de Gestión de Inventario
      </footer>
    </>
  )
}

const camposCategoria = [
  { nombre: 'nombre', etiqueta: 'Nombre', enTabla: true },
  { nombre: 'descripcion', etiqueta: 'Descripción', enTabla: true },
]

const camposProveedor = [
  { nombre: 'nombre', etiqueta: 'Nombre', enTabla: true },
  { nombre: 'nit', etiqueta: 'NIT', enTabla: true },
  { nombre: 'telefono', etiqueta: 'Teléfono', enTabla: true },
  { nombre: 'correo', etiqueta: 'Correo', tipo: 'email', enTabla: true },
  { nombre: 'direccion', etiqueta: 'Dirección' },
]

const camposBodega = [
  { nombre: 'nombre', etiqueta: 'Nombre', enTabla: true },
  { nombre: 'ubicacion', etiqueta: 'Ubicación', enTabla: true },
]

const camposUsuario = [
  { nombre: 'username', etiqueta: 'Usuario', enTabla: true },
  { nombre: 'first_name', etiqueta: 'Nombres', enTabla: true },
  { nombre: 'last_name', etiqueta: 'Apellidos', enTabla: true },
  { nombre: 'email', etiqueta: 'Correo', tipo: 'email' },
  {
    nombre: 'rol', etiqueta: 'Rol', tipo: 'select', enTabla: true, inicial: 'ALMACENISTA',
    opciones: [
      { valor: 'ADMIN', texto: 'Administrador' },
      { valor: 'ALMACENISTA', texto: 'Almacenista' },
      { valor: 'GERENTE', texto: 'Gerente' },
    ],
  },
  { nombre: 'password', etiqueta: 'Contraseña (dejar vacía para no cambiarla)', tipo: 'password' },
  { nombre: 'is_active', etiqueta: 'Activo', tipo: 'checkbox', enTabla: true, inicial: true },
]

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RutaPrivada><Inicio /></RutaPrivada>} />

        <Route path="/productos" element={<RutaPrivada><Productos /></RutaPrivada>} />
        <Route path="/productos/nuevo" element={<RutaPrivada roles={ADMIN}><ProductoForm /></RutaPrivada>} />
        <Route path="/productos/:id/editar" element={<RutaPrivada roles={ADMIN}><ProductoForm /></RutaPrivada>} />
        <Route path="/productos/:id/codigo" element={<RutaPrivada><CodigoBarras /></RutaPrivada>} />

        <Route path="/stock" element={<RutaPrivada><Stock /></RutaPrivada>} />
        <Route path="/movimientos" element={<RutaPrivada><Movimientos /></RutaPrivada>} />
        <Route path="/movimientos/nuevo" element={<RutaPrivada roles={REGISTRA}><MovimientoForm /></RutaPrivada>} />
        <Route path="/reportes" element={<RutaPrivada roles={REPORTES}><Reportes /></RutaPrivada>} />

        <Route path="/categorias" element={
          <RutaPrivada roles={ADMIN}><CrudSimple key="categorias" titulo="Categorías" ruta="/categorias/" campos={camposCategoria} /></RutaPrivada>
        } />
        <Route path="/proveedores" element={
          <RutaPrivada roles={ADMIN}><CrudSimple key="proveedores" titulo="Proveedores" ruta="/proveedores/" campos={camposProveedor} /></RutaPrivada>
        } />
        <Route path="/bodegas" element={
          <RutaPrivada roles={ADMIN}><CrudSimple key="bodegas" titulo="Bodegas" ruta="/bodegas/" campos={camposBodega} /></RutaPrivada>
        } />
        <Route path="/usuarios" element={
          <RutaPrivada roles={ADMIN}><CrudSimple key="usuarios" titulo="Usuarios" ruta="/usuarios/" campos={camposUsuario} /></RutaPrivada>
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
