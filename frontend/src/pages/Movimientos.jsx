import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getSesion, textoError } from '../api'

const filtrosVacios = { tipo: '', producto: '', bodega: '', desde: '', hasta: '' }

export default function Movimientos() {
  const puedeRegistrar = ['ADMIN', 'ALMACENISTA'].includes(getSesion().usuario.rol)
  const [movimientos, setMovimientos] = useState([])
  const [productos, setProductos] = useState([])
  const [bodegas, setBodegas] = useState([])
  const [filtros, setFiltros] = useState(filtrosVacios)
  const [error, setError] = useState('')

  async function cargar(f = filtros) {
    try {
      const parametros = new URLSearchParams(f).toString()
      setMovimientos(await api(`/movimientos/?${parametros}`))
    } catch (e) {
      setError(textoError(e))
    }
  }

  useEffect(() => {
    api('/productos/').then(setProductos)
    api('/bodegas/').then(setBodegas)
    cargar()
  }, [])

  function cambiar(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  function limpiar() {
    setFiltros(filtrosVacios)
    cargar(filtrosVacios)
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Historial de movimientos</h3>
        {puedeRegistrar && (
          <div>
            <Link to="/movimientos/nuevo?tipo=ENTRADA" className="btn btn-primario me-2">+ Entrada</Link>
            <Link to="/movimientos/nuevo?tipo=SALIDA" className="btn btn-primario">− Salida</Link>
          </div>
        )}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card tarjeta p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-2">
            <label className="form-label small">Tipo</label>
            <select className="form-select" name="tipo" value={filtros.tipo} onChange={cambiar}>
              <option value="">Todos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label small">Producto</label>
            <select className="form-select" name="producto" value={filtros.producto} onChange={cambiar}>
              <option value="">Todos</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small">Bodega</label>
            <select className="form-select" name="bodega" value={filtros.bodega} onChange={cambiar}>
              <option value="">Todas</option>
              {bodegas.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small">Desde</label>
            <input className="form-control" type="date" name="desde" value={filtros.desde} onChange={cambiar} />
          </div>
          <div className="col-md-2">
            <label className="form-label small">Hasta</label>
            <input className="form-control" type="date" name="hasta" value={filtros.hasta} onChange={cambiar} />
          </div>
          <div className="col-md-1 d-flex gap-1">
            <button className="btn btn-primario" onClick={() => cargar()}>Filtrar</button>
          </div>
        </div>
        <div className="mt-2">
          <button className="btn btn-link btn-sm p-0" onClick={limpiar}>Limpiar filtros</button>
        </div>
      </div>

      <div className="card tarjeta p-3">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th>Fecha</th><th>Tipo</th><th>Código</th><th>Producto</th><th>Bodega</th>
              <th>Cantidad</th><th>Usuario</th><th>Observación</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m) => (
              <tr key={m.id}>
                <td>{new Date(m.fecha).toLocaleString('es-CO')}</td>
                <td>
                  <span className={`badge ${m.tipo === 'ENTRADA' ? 'bg-success' : 'bg-danger'}`}>{m.tipo}</span>
                </td>
                <td>{m.producto_codigo}</td>
                <td>{m.producto_nombre}</td>
                <td>{m.bodega_nombre}</td>
                <td>{m.cantidad}</td>
                <td>{m.usuario_nombre}</td>
                <td>{m.observacion}</td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr><td colSpan="8" className="text-center text-muted">No hay movimientos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
