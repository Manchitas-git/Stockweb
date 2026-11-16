import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getSesion, textoError } from '../api'

export default function Inicio() {
  const usuario = getSesion().usuario
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/dashboard/').then(setDatos).catch((e) => setError(textoError(e)))
  }, [])

  const puedeRegistrar = ['ADMIN', 'ALMACENISTA'].includes(usuario.rol)

  return (
    <>
      <h3 className="mb-0">Bienvenido, {usuario.nombre}</h3>
      <p className="text-muted">Resumen del inventario al día de hoy</p>
      {error && <div className="alert alert-danger">{error}</div>}

      {datos && (
        <>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card tarjeta indicador p-3">
                <small className="text-muted">Productos registrados</small>
                <h2>{datos.productos}</h2>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card tarjeta indicador alerta p-3">
                <small className="text-muted">Con stock bajo</small>
                <h2>{datos.stock_bajo}</h2>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card tarjeta indicador p-3">
                <small className="text-muted">Entradas hoy</small>
                <h2>{datos.entradas_hoy}</h2>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card tarjeta indicador p-3">
                <small className="text-muted">Salidas hoy</small>
                <h2>{datos.salidas_hoy}</h2>
              </div>
            </div>
          </div>

          <div className="mb-4">
            {puedeRegistrar && (
              <>
                <Link to="/movimientos/nuevo?tipo=ENTRADA" className="btn btn-primario me-2">+ Registrar entrada</Link>
                <Link to="/movimientos/nuevo?tipo=SALIDA" className="btn btn-primario me-2">− Registrar salida</Link>
              </>
            )}
            {usuario.rol === 'ADMIN' && (
              <Link to="/productos/nuevo" className="btn btn-outline-primario">Nuevo producto</Link>
            )}
          </div>

          <div className="card tarjeta p-3">
            <h6 className="fw-bold">Productos con stock bajo</h6>
            <table className="table mb-0">
              <thead>
                <tr><th>Código</th><th>Producto</th><th>Bodega</th><th>Stock</th><th>Mínimo</th></tr>
              </thead>
              <tbody>
                {datos.lista_stock_bajo.map((s) => (
                  <tr key={s.id}>
                    <td>{s.producto_codigo}</td>
                    <td>{s.producto_nombre}</td>
                    <td>{s.bodega_nombre}</td>
                    <td className="text-danger fw-bold">{s.cantidad}</td>
                    <td>{s.stock_minimo}</td>
                  </tr>
                ))}
                {datos.lista_stock_bajo.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted">No hay productos con stock bajo</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}
