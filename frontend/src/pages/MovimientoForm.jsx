import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api, textoError } from '../api'

export default function MovimientoForm() {
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const [productos, setProductos] = useState([])
  const [bodegas, setBodegas] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    tipo: parametros.get('tipo') || 'ENTRADA',
    producto: '',
    bodega: '',
    cantidad: '',
    observacion: '',
  })

  useEffect(() => {
    api('/productos/').then(setProductos)
    api('/bodegas/').then(setBodegas)
  }, [])

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function guardar(e) {
    e.preventDefault()
    try {
      await api('/movimientos/', 'POST', form)
      navigate('/movimientos')
    } catch (err) {
      setError(textoError(err))
    }
  }

  return (
    <>
      <h3 className="mb-3">Nuevo movimiento</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card tarjeta p-4" style={{ maxWidth: 600 }}>
        <form onSubmit={guardar}>
          <div className="row mb-3">
            <label className="col-sm-3 col-form-label">Tipo</label>
            <div className="col-sm-9">
              <select className="form-select" name="tipo" value={form.tipo} onChange={cambiar}>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-3 col-form-label">Producto</label>
            <div className="col-sm-9">
              <select className="form-select" name="producto" value={form.producto} onChange={cambiar} required>
                <option value="">Seleccione...</option>
                {productos.map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-3 col-form-label">Bodega</label>
            <div className="col-sm-9">
              <select className="form-select" name="bodega" value={form.bodega} onChange={cambiar} required>
                <option value="">Seleccione...</option>
                {bodegas.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-3 col-form-label">Cantidad</label>
            <div className="col-sm-9">
              <input className="form-control" type="number" min="1" name="cantidad"
                value={form.cantidad} onChange={cambiar} required />
            </div>
          </div>
          <div className="row mb-3">
            <label className="col-sm-3 col-form-label">Observación</label>
            <div className="col-sm-9">
              <input className="form-control" name="observacion" value={form.observacion} onChange={cambiar} />
            </div>
          </div>
          <div className="text-end">
            <button className="btn btn-primario me-2">Guardar</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Cancelar</button>
          </div>
        </form>
      </div>
    </>
  )
}
