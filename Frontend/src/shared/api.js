
const STORAGE_TOKEN_KEY = 'icfes_saber11_auth_token'
const STORAGE_USER_KEY = 'icfes_saber11_auth_user'


export function obtenerToken() {
  return localStorage.getItem(STORAGE_TOKEN_KEY)
}


export function obtenerUsuarioActual() {
  const guardado = localStorage.getItem(STORAGE_USER_KEY)
  try {
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}


export function guardarSesion(token, usuario) {
  localStorage.setItem(STORAGE_TOKEN_KEY, token)
  localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(usuario))
}


export function cerrarSesion() {
  localStorage.removeItem(STORAGE_TOKEN_KEY)
  localStorage.removeItem(STORAGE_USER_KEY)
}


export class ErrorApi extends Error {
  constructor(status, mensaje, detalles = null) {
    super(mensaje)
    this.name = 'ErrorApi'
    this.status = status
    this.detalles = detalles
  }
}


const MENSAJES_ESTADO_HTTP = {
  400: 'HTTP 400 · Datos inválidos. Revisa las restricciones numéricas o campos requeridos.',
  401: 'HTTP 401 · No autorizado. Esta operación de escritura o gestión exige un Token válido de autenticación.',
  403: 'HTTP 403 · Acceso denegado. No tienes permisos para realizar esta acción.',
  404: 'HTTP 404 · Registro no encontrado o endpoint inexistente en el enrutador de Django.',
  405: 'HTTP 405 · Método HTTP no permitido para este recurso.',
  500: 'HTTP 500 · Error interno del servidor en Django. Revisa la consola del backend.',
  502: 'HTTP 502 · Error al conectar con el portal externo datos.gov.co.',
}


export async function peticionApi(endpoint, opciones = {}) {
  const inicio = performance.now()
  const token = obtenerToken()

  const encabezados = {
    'Accept': 'application/json',
    ...(opciones.headers || {}),
  }

  
  if (opciones.body && !encabezados['Content-Type']) {
    encabezados['Content-Type'] = 'application/json'
  }

  // Inyecta automáticamente el token de DRF si el usuario está autenticado
  if (token) {
    encabezados['Authorization'] = `Token ${token}`
  }

  let respuesta
  try {
    respuesta = await fetch(endpoint, {
      ...opciones,
      headers: encabezados,
    })
  } catch (error) {
    throw new ErrorApi(
      0,
      'No fue posible conectar con el servidor backend de Django. Verifica que el servidor esté activo en el puerto 8000.',
      error
    )
  }

  const ms = Math.round(performance.now() - inicio)

  // Si el servidor respondió con un error HTTP (códigos 4xx o 5xx)
  if (!respuesta.ok) {
    let detalleServidor = null
    try {
      detalleServidor = await respuesta.json()
    } catch {
      detalleServidor = null
    }

    const mensajeExplicativo =
      (detalleServidor && (detalleServidor.error || detalleServidor.detail || detalleServidor.detalle)) ||
      MENSAJES_ESTADO_HTTP[respuesta.status] ||
      `HTTP ${respuesta.status} · Respuesta de error del servidor`

    throw new ErrorApi(respuesta.status, mensajeExplicativo, detalleServidor)
  }

  // Si la respuesta es 204 No Content (como en DELETE exitoso)
  if (respuesta.status === 204) {
    return { datos: null, ms, status: 204 }
  }

  // Parsea el cuerpo JSON retornado
  let datos = null
  try {
    datos = await respuesta.json()
  } catch {
    datos = null
  }

  return { datos, ms, status: respuesta.status }
}

/**
 * Inicia sesión contra /api/token/ enviando username y password.
 */
export async function loginUsuario(username, password) {
  const { datos } = await peticionApi('/api/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

  const token = datos.token
  const usuarioInfo = { username }
  guardarSesion(token, usuarioInfo)
  return { token, usuario: usuarioInfo }
}

/**
 * Consulta la lista paginada de resultados Saber 11 con soporte de filtros SQL y ordenamiento.
 */
export async function listarResultados(parametros = {}) {
  const query = new URLSearchParams()
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      query.append(clave, valor)
    }
  })

  const ruta = `/api/resultados/?${query.toString()}`
  return await peticionApi(ruta)
}

/**
 * Consulta las estadísticas analíticas agregadas (calculadas vía ORM aggregate y annotate).
 */
export async function obtenerEstadisticas(parametros = {}) {
  const query = new URLSearchParams()
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      query.append(clave, valor)
    }
  })

  const ruta = `/api/resultados/estadisticas/?${query.toString()}`
  return await peticionApi(ruta)
}

/**
 * Consulta la lista de instituciones educativas maestras.
 */
export async function listarInstituciones(parametros = {}) {
  const query = new URLSearchParams()
  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      query.append(clave, valor)
    }
  })

  const ruta = `/api/instituciones/?${query.toString()}`
  return await peticionApi(ruta)
}

/**
 * Registra un nuevo resultado individual Saber 11 (Operación de escritura protegida con Token).
 */
export async function crearResultado(datosFormulario) {
  return await peticionApi('/api/resultados/', {
    method: 'POST',
    body: JSON.stringify(datosFormulario),
  })
}

/**
 * Modifica un resultado existente por ID (Operación de escritura protegida con Token).
 */
export async function actualizarResultado(id, datosFormulario) {
  return await peticionApi(`/api/resultados/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(datosFormulario),
  })
}

/**
 * Elimina un resultado de examen por ID (Operación de escritura protegida con Token).
 */
export async function eliminarResultado(id) {
  return await peticionApi(`/api/resultados/${id}/`, {
    method: 'DELETE',
  })
}

/**
 * Dispara la ingestión masiva desde datos.gov.co (Operación de gestión protegida con Token).
 */
export async function dispararIngestion(cantidad = 5000, periodo = '20224') {
  return await peticionApi('/api/resultados/inyeccion/', {
    method: 'POST',
    body: JSON.stringify({ cantidad, periodo }),
  })
}


export async function consultarEstadoSistema() {
  return await peticionApi('/api/estado/')
}

export async function obtenerResumenIngestion() {
  return await peticionApi('/api/resumen-ingestion/')
}


export async function limpiarResultadosMasivos() {
  return await peticionApi('/api/resultados/limpieza/', {
    method: 'DELETE',
    body: JSON.stringify({ confirmar: true }),
  })
}