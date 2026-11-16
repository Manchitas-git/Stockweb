import { useEffect, useState } from 'react'
import { api, textoError } from '../api'

export default function Stock() {
  const [stock, setStock] = useState([])
  const [productos, setProductos] = useState([])
  const [bodegas, setBodegas] = useState([])
  const [producto, setProducto] = useState('')
  const [bodega, setBodega] = useState('')
  const [soloBajo, setSoloBajo] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/productos/').then(setProductos)
    api('/bodegas/').then(setBodegas)
  }, [])

  useEffect(() => {
    const bajo = soloBajo ? '1' : ''
    api(`/stock/?producto=${producto}&bodega=${bodega}&bajo=${bajo}`)
      .then(setStock)
      .catch((e) => setError(textoError(e)))
  }, [producto, bodega, soloBajo])

  return (
    <>
      <h3 className="mb-3">Consulta de stock</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex gap-2 align-items-center mb-3">
        <select className="form-select w-auto" value={producto} onChange={(e) => setProducto(e.target.value)}>
          <option value="">Todos los productos</option>
          {productos.map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
        </select>
        <select className="form-select w-auto" value={bodega} onChange={(e) => setBodega(e.target.value)}>
          <option value="">Todas las bodegas</option>
          {bodegas.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </select>
        <div className="form-check ms-2">
          <input className="form-check-input" type="checkbox" id="bajo" checked={soloBajo}
            onChange={(e) => setSoloBajo(e.target.checked)} />
          <label className="form-check-label" htmlFor="bajo">Solo alertas (bajo el mínimo)</label>
        </div>
      </div>

      <div className="card tarjeta p-3">
        <table className="table table-hover mb-0">
          <thead>
            <tr><th>Código</th><th>Producto</th><th>Bodega</th><th>Stock</th><th>Mínimo</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {stock.map((s) => {
              const bajo = s.cantidad < s.stock_minimo
              return (
                <tr key={s.id}>
                  <td>{s.producto_codigo}</td>
                  <td>{s.producto_nombre}</td>
                  <td>{s.bodega_nombre}</td>
                  <td className={bajo ? 'text-danger fw-bold' : ''}>{s.cantidad}</td>
                  <td>{s.stock_minimo}</td>
                  <td>
                    {bajo
                      ? <span className="badge bg-danger">Stock bajo</span>
                      : <span className="badge bg-success">OK</span>}
                  </td>
                </tr>
              )
            })}
            {stock.length === 0 && (
              <tr><td colSpan="6" className="text-center text-muted">No hay datos de stock</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
