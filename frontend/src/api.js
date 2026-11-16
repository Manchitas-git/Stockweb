const API_URL = 'http://localhost:8000/api'

export function getSesion() {
  return JSON.parse(localStorage.getItem('sesion'))
}

export function guardarSesion(sesion) {
  localStorage.setItem('sesion', JSON.stringify(sesion))
}

export function borrarSesion() {
  localStorage.removeItem('sesion')
}

function cabeceras() {
  const headers = { 'Content-Type': 'application/json' }
  const sesion = getSesion()
  if (sesion) headers['Authorization'] = 'Token ' + sesion.token
  return headers
}

// Funcion general para llamar al backend de Django
export async function api(ruta, metodo = 'GET', datos = null) {
  const respuesta = await fetch(API_URL + ruta, {
    method: metodo,
    headers: cabeceras(),
    body: datos ? JSON.stringify(datos) : null,
  })
  if (respuesta.status === 401) {
    borrarSesion()
    window.location.href = '/login'
    return
  }
  if (respuesta.status === 204) return null
  const json = await respuesta.json()
  if (!respuesta.ok) throw json
  return json
}

// Para los reportes PDF y Excel que vienen como archivo
export async function descargar(ruta, nombreArchivo) {
  const respuesta = await fetch(API_URL + ruta, { headers: cabeceras() })
  if (!respuesta.ok) throw { detail: 'No se pudo generar el reporte.' }
  const archivo = await respuesta.blob()
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(archivo)
  enlace.download = nombreArchivo
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

// Convierte los errores que manda Django REST en un texto para mostrar
export function textoError(error) {
  if (!error) return 'Ocurrió un error.'
  if (error instanceof Error) return 'No se pudo conectar con el servidor.'
  if (error.detail) return error.detail
  return Object.entries(error)
    .map(([campo, mensajes]) => (campo === 'non_field_errors' ? mensajes : `${campo}: ${mensajes}`))
    .join(' | ')
}
