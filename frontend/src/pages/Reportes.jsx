import { useState } from 'react'
import { descargar, textoError } from '../api'

export default function Reportes() {
  const [tipo, setTipo] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [error, setError] = useState('')

  async function bajarStock(formato) {
    try {
      const extension = formato === 'excel' ? 'xlsx' : 'pdf'
      await descargar(`/reportes/stock/?formato=${formato}`, `reporte_stock.${extension}`)
    } catch (e) {
      setError(textoError(e))
    }
  }

  async function bajarMovimientos(formato) {
    try {
      const extension = formato === 'excel' ? 'xlsx' : 'pdf'
      const parametros = new URLSearchParams({ formato, tipo, desde, hasta }).toString()
      await descargar(`/reportes/movimientos/?${parametros}`, `reporte_movimientos.${extension}`)
    } catch (e) {
      setError(textoError(e))
    }
  }

  return (
    <>
      <h3 className="mb-3">Reportes</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        <div className="col-md-5">
          <div className="card tarjeta p-4 h-100">
            <h5>Stock por bodega</h5>
            <p className="text-muted small">Muestra la cantidad actual de cada producto en cada bodega junto a su stock mínimo.</p>
            <div className="mt-auto">
              <button className="btn btn-primario me-2" onClick={() => bajarStock('pdf')}>Descargar PDF</button>
              <button className="btn btn-outline-primario" onClick={() => bajarStock('excel')}>Descargar Excel</button>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card tarjeta p-4 h-100">
            <h5>Movimientos</h5>
            <p className="text-muted small">Entradas y salidas registradas. Puede filtrar por tipo y rango de fechas.</p>
            <div className="row g-2 mb-3">
              <div className="col-md-4">
                <label className="form-label small">Tipo</label>
                <select className="form-select" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="ENTRADA">Entradas</option>
                  <option value="SALIDA">Salidas</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small">Desde</label>
                <input className="form-control" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Hasta</label>
                <input className="form-control" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </div>
            </div>
            <div>
              <button className="btn btn-primario me-2" onClick={() => bajarMovimientos('pdf')}>Descargar PDF</button>
              <button className="btn btn-outline-primario" onClick={() => bajarMovimientos('excel')}>Descargar Excel</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
