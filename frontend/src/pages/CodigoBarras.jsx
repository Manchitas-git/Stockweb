import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import JsBarcode from 'jsbarcode'
import { api, textoError } from '../api'

// Una etiqueta con el nombre del producto y su codigo de barras
function Etiqueta({ producto }) {
  const svgRef = useRef(null)

  useEffect(() => {
    JsBarcode(svgRef.current, producto.codigo_barras, {
      format: 'EAN13',
      height: 60,
      fontSize: 14,
    })
  }, [producto])

  return (
    <div className="etiqueta">
      <div className="fw-bold small">{producto.nombre}</div>
      <div className="small text-muted">{producto.codigo}</div>
      <svg ref={svgRef}></svg>
    </div>
  )
}

export default function CodigoBarras() {
  const { id } = useParams()
  const [producto, setProducto] = useState(null)
  const [copias, setCopias] = useState(1)
  const [error, setError] = useState('')

  useEffect(() => {
    api(`/productos/${id}/`).then(setProducto).catch((e) => setError(textoError(e)))
  }, [id])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!producto) return <p>Cargando...</p>

  return (
    <>
      <div className="no-print">
        <h3 className="mb-1">Código de barras</h3>
        <p className="text-muted">
          Producto registrado: <b>{producto.nombre}</b>. Elija cuántas etiquetas quiere y presione imprimir.
        </p>
        <div className="d-flex gap-2 align-items-center mb-4">
          <label>Cantidad de etiquetas</label>
          <input className="form-control" style={{ width: 90 }} type="number" min="1" max="100"
            value={copias} onChange={(e) => setCopias(Number(e.target.value))} />
          <button className="btn btn-primario" onClick={() => window.print()}>Imprimir</button>
          <Link to="/productos" className="btn btn-outline-secondary">Volver a productos</Link>
        </div>
      </div>

      <div className="hoja-etiquetas">
        {Array.from({ length: Math.max(1, copias) }, (_, i) => (
          <Etiqueta key={i} producto={producto} />
        ))}
      </div>
    </>
  )
}
