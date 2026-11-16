import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api, textoError } from '../api'

const vacio = {
  codigo: '', nombre: '', descripcion: '', categoria: '', proveedor: '', precio: 0, stock_minimo: 0,
}

export default function ProductoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(vacio)
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [imprimirCodigo, setImprimirCodigo] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/categorias/').then(setCategorias)
    api('/proveedores/').then(setProveedores)
    if (id) {
      api(`/productos/${id}/`).then((p) => setForm({ ...p, proveedor: p.proveedor ?? '' }))
    }
  }, [id])

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function guardar(e) {
    e.preventDefault()
    const datos = { ...form, proveedor: form.proveedor || null }
    try {
      if (id) {
        await api(`/productos/${id}/`, 'PUT', datos)
        navigate('/productos')
      } else {
        const nuevo = await api('/productos/', 'POST', datos)
        // Si se marco la opcion, despues de guardar se abre la etiqueta para imprimir
        if (imprimirCodigo) navigate(`/productos/${nuevo.id}/codigo`)
        else navigate('/productos')
      }
    } catch (err) {
      setError(textoError(err))
    }
  }

  return (
    <>
      <h3 className="mb-3">{id ? 'Editar producto' : 'Nuevo producto'}</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card tarjeta p-4" style={{ maxWidth: 700 }}>
        <form onSubmit={guardar} className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Código</label>
            <input className="form-control" name="codigo" value={form.codigo} onChange={cambiar} required />
          </div>
          <div className="col-md-8">
            <label className="form-label">Nombre</label>
            <input className="form-control" name="nombre" value={form.nombre} onChange={cambiar} required />
          </div>
          <div className="col-12">
            <label className="form-label">Descripción</label>
            <textarea className="form-control" name="descripcion" value={form.descripcion} onChange={cambiar} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Categoría</label>
            <select className="form-select" name="categoria" value={form.categoria} onChange={cambiar} required>
              <option value="">Seleccione...</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Proveedor</label>
            <select className="form-select" name="proveedor" value={form.proveedor} onChange={cambiar}>
              <option value="">Sin proveedor</option>
              {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Precio</label>
            <input className="form-control" type="number" min="0" step="0.01" name="precio"
              value={form.precio} onChange={cambiar} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Stock mínimo</label>
            <input className="form-control" type="number" min="0" name="stock_minimo"
              value={form.stock_minimo} onChange={cambiar} />
          </div>

          {id ? (
            <div className="col-12 text-muted small">Código de barras: {form.codigo_barras}</div>
          ) : (
            <div className="col-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="imprimir"
                  checked={imprimirCodigo} onChange={(e) => setImprimirCodigo(e.target.checked)} />
                <label className="form-check-label" htmlFor="imprimir">
                  Imprimir la etiqueta con el código de barras al guardar
                </label>
                <div className="form-text">El código de barras se genera automáticamente al registrar el producto.</div>
              </div>
            </div>
          )}

          <div className="col-12">
            <button className="btn btn-primario me-2">Guardar</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/productos')}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
