import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getSesion, textoError } from '../api'

const POR_PAGINA = 10

export default function Productos() {
  const esAdmin = getSesion().usuario.rol === 'ADMIN'
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [buscar, setBuscar] = useState('')
  const [categoria, setCategoria] = useState('')
  const [pagina, setPagina] = useState(1)
  const [error, setError] = useState('')

  async function cargar() {
    try {
      const datos = await api(`/productos/?buscar=${encodeURIComponent(buscar)}&categoria=${categoria}`)
      setProductos(datos)
      setPagina(1)
    } catch (e) {
      setError(textoError(e))
    }
  }

  useEffect(() => {
    api('/categorias/').then(setCategorias).catch((e) => setError(textoError(e)))
  }, [])

  // Cada vez que cambia el texto o la categoria se vuelve a buscar
  useEffect(() => {
    cargar()
  }, [buscar, categoria])

  async function eliminar(producto) {
    if (!window.confirm(`¿Eliminar el producto ${producto.nombre}?`)) return
    try {
      await api(`/productos/${producto.id}/`, 'DELETE')
      cargar()
    } catch (e) {
      setError(textoError(e))
    }
  }

  const totalPaginas = Math.max(1, Math.ceil(productos.length / POR_PAGINA))
  const visibles = productos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA)

  return (
    <>
      <h3 className="mb-3">Productos</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex gap-2 mb-3">
        <input className="form-control" placeholder="Buscar producto por nombre o código..."
          value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <select className="form-select w-auto" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        {esAdmin && <Link to="/productos/nuevo" className="btn btn-primario text-nowrap">+ Nuevo</Link>}
      </div>

      <div className="card tarjeta p-3">
        <table className="table table-hover mb-0">
          <thead>
            <tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Stock</th><th>Mínimo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {visibles.map((p) => (
              <tr key={p.id}>
                <td>{p.codigo}</td>
                <td>{p.nombre}</td>
                <td>{p.categoria_nombre}</td>
                <td className={p.stock_total < p.stock_minimo ? 'text-danger fw-bold' : ''}>{p.stock_total}</td>
                <td>{p.stock_minimo}</td>
                <td>
                  <Link to={`/productos/${p.id}/codigo`} className="btn btn-link btn-sm p-0 me-2">Código de barras</Link>
                  {esAdmin && (
                    <>
                      <Link to={`/productos/${p.id}/editar`} className="btn btn-link btn-sm p-0 me-2">Editar</Link>
                      <button className="btn btn-link btn-sm p-0 text-danger" onClick={() => eliminar(p)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr><td colSpan="6" className="text-center text-muted">No se encontraron productos</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-center gap-1 mt-3">
        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
          <button key={n} className={`btn btn-sm ${n === pagina ? 'btn-primario' : 'btn-outline-secondary'}`}
            onClick={() => setPagina(n)}>{n}</button>
        ))}
      </div>
    </>
  )
}
