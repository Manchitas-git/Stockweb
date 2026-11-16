import { useEffect, useState } from 'react'
import { api, textoError } from '../api'

// Componente que se reutiliza para Categorias, Proveedores, Bodegas y Usuarios.
// Recibe la ruta del API y la lista de campos del formulario.
export default function CrudSimple({ titulo, ruta, campos }) {
  const formularioVacio = {}
  campos.forEach((c) => (formularioVacio[c.nombre] = c.inicial ?? ''))

  const [lista, setLista] = useState([])
  const [form, setForm] = useState(formularioVacio)
  const [editandoId, setEditandoId] = useState(null)
  const [error, setError] = useState('')

  async function cargar() {
    try {
      setLista(await api(ruta))
    } catch (e) {
      setError(textoError(e))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  function cambiar(e) {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  function limpiar() {
    setForm(formularioVacio)
    setEditandoId(null)
    setError('')
  }

  async function guardar(e) {
    e.preventDefault()
    try {
      if (editandoId) await api(ruta + editandoId + '/', 'PUT', form)
      else await api(ruta, 'POST', form)
      limpiar()
      cargar()
    } catch (err) {
      setError(textoError(err))
    }
  }

  function editar(item) {
    const datos = {}
    campos.forEach((c) => (datos[c.nombre] = item[c.nombre] ?? ''))
    setForm(datos)
    setEditandoId(item.id)
    setError('')
  }

  async function eliminar(item) {
    if (!window.confirm('¿Seguro que desea eliminar este registro?')) return
    try {
      await api(ruta + item.id + '/', 'DELETE')
      cargar()
    } catch (err) {
      setError(textoError(err))
    }
  }

  function mostrarValor(campo, item) {
    const valor = item[campo.nombre]
    if (campo.tipo === 'checkbox') return valor ? 'Sí' : 'No'
    if (campo.tipo === 'select') return campo.opciones.find((o) => o.valor === valor)?.texto
    return valor
  }

  const columnas = campos.filter((c) => c.enTabla)

  return (
    <>
      <h3 className="mb-3">{titulo}</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card tarjeta p-3 mb-4">
        <h6>{editandoId ? 'Editar registro' : 'Nuevo registro'}</h6>
        <form onSubmit={guardar} className="row g-2">
          {campos.map((c) => (
            <div className="col-md-4" key={c.nombre}>
              {c.tipo === 'checkbox' ? (
                <div className="form-check mt-4">
                  <input className="form-check-input" type="checkbox" name={c.nombre} id={c.nombre}
                    checked={!!form[c.nombre]} onChange={cambiar} />
                  <label className="form-check-label" htmlFor={c.nombre}>{c.etiqueta}</label>
                </div>
              ) : (
                <>
                  <label className="form-label small">{c.etiqueta}</label>
                  {c.tipo === 'select' ? (
                    <select className="form-select" name={c.nombre} value={form[c.nombre]} onChange={cambiar}>
                      {c.opciones.map((o) => <option key={o.valor} value={o.valor}>{o.texto}</option>)}
                    </select>
                  ) : (
                    <input className="form-control" type={c.tipo || 'text'} name={c.nombre}
                      value={form[c.nombre]} onChange={cambiar} />
                  )}
                </>
              )}
            </div>
          ))}
          <div className="col-12 mt-3">
            <button className="btn btn-primario me-2">Guardar</button>
            <button type="button" className="btn btn-outline-secondary" onClick={limpiar}>Cancelar</button>
          </div>
        </form>
      </div>

      <div className="card tarjeta p-3">
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              {columnas.map((c) => <th key={c.nombre}>{c.etiqueta}</th>)}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((item) => (
              <tr key={item.id}>
                {columnas.map((c) => <td key={c.nombre}>{mostrarValor(c, item)}</td>)}
                <td>
                  <button className="btn btn-link btn-sm p-0 me-2" onClick={() => editar(item)}>Editar</button>
                  <button className="btn btn-link btn-sm p-0 text-danger" onClick={() => eliminar(item)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr><td colSpan={columnas.length + 1} className="text-center text-muted">No hay registros</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
