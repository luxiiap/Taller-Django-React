
import { useEffect, useState } from 'react'
import { actualizarResultado, crearResultado, listarInstituciones } from '../../shared/api'

export default function ResultadoModal({
  isOpen,
  resultadoAEditar,
  onClose,
  onGuardadoExitoso,
  onExigeAutenticacion,
}) {
  const [instituciones, setInstituciones] = useState([])
  const [institucionId, setInstitucionId] = useState('')
  const [consecutivo, setConsecutivo] = useState('')
  const [anio, setAnio] = useState(2022)
  const [periodo, setPeriodo] = useState('20224')
  const [puntajeGlobal, setPuntajeGlobal] = useState(250)
  const [puntajeMatematicas, setPuntajeMatematicas] = useState(50)
  const [puntajeLectura, setPuntajeLectura] = useState(50)
  const [puntajeCiencias, setPuntajeCiencias] = useState(50)
  const [puntajeIngles, setPuntajeIngles] = useState(50)
  const [puntajeSociales, setPuntajeSociales] = useState(50)
  const [observacion, setObservacion] = useState('')

  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  // Carga instituciones maestras al abrir el modal para alimentar el <select>
  useEffect(() => {
    if (isOpen) {
      listarInstituciones({ page_size: 100 })
        .then(({ datos }) => {
          if (datos && datos.results) {
            setInstituciones(datos.results)
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  // Inicializa o resetea los campos según si se está creando o editando un registro
  useEffect(() => {
    if (resultadoAEditar) {
      setInstitucionId(resultadoAEditar.institucion || '')
      setConsecutivo(resultadoAEditar.consecutivo || '')
      setAnio(resultadoAEditar.anio || 2022)
      setPeriodo(resultadoAEditar.periodo || '20224')
      setPuntajeGlobal(resultadoAEditar.puntaje_global ?? 250)
      setPuntajeMatematicas(resultadoAEditar.puntaje_matematicas ?? 50)
      setPuntajeLectura(resultadoAEditar.puntaje_lectura ?? 50)
      setPuntajeCiencias(resultadoAEditar.puntaje_ciencias ?? 50)
      setPuntajeIngles(resultadoAEditar.puntaje_ingles ?? 50)
      setPuntajeSociales(resultadoAEditar.puntaje_sociales ?? 50)
      setObservacion(resultadoAEditar.observacion || '')
    } else {
      setInstitucionId('')
      setConsecutivo(`SB11${Date.now().toString().slice(-8)}`)
      setAnio(2022)
      setPeriodo('20224')
      setPuntajeGlobal(250)
      setPuntajeMatematicas(50)
      setPuntajeLectura(50)
      setPuntajeCiencias(50)
      setPuntajeIngles(50)
      setPuntajeSociales(50)
      setObservacion('Registro creado manualmente desde el explorador')
    }
    setError(null)
  }, [resultadoAEditar, isOpen])

  if (!isOpen) return null

  // Maneja el envío del formulario a la API
  async function manejarSubmit(evento) {
    evento.preventDefault()
    setError(null)
    setCargando(true)

    const payload = {
      institucion: parseInt(institucionId, 10),
      consecutivo: consecutivo.trim().toUpperCase(),
      anio: parseInt(anio, 10),
      periodo: periodo.trim(),
      puntaje_global: parseInt(puntajeGlobal, 10),
      puntaje_matematicas: parseInt(puntajeMatematicas, 10),
      puntaje_lectura: parseInt(puntajeLectura, 10),
      puntaje_ciencias: parseInt(puntajeCiencias, 10),
      puntaje_ingles: parseInt(puntajeIngles, 10),
      puntaje_sociales: parseInt(puntajeSociales, 10),
      observacion: observacion.trim(),
    }

    try {
      if (resultadoAEditar) {
        // Operación PUT/PATCH protegida
        await actualizarResultado(resultadoAEditar.id, payload)
      } else {
        // Operación POST protegida
        await crearResultado(payload)
      }
      onGuardadoExitoso()
      onClose()
    } catch (err) {
      if (err.status === 401) {
        setError(
          'HTTP 401 Unauthorized · Operación protegida. Debes iniciar sesión con usuario y contraseña para poder modificar o crear registros.'
        )
        if (onExigeAutenticacion) onExigeAutenticacion()
      } else {
        setError(err.message || 'Error al guardar el registro.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{resultadoAEditar ? 'Editar Resultado Saber 11' : 'Registrar Nuevo Examen Saber 11'}</h3>
          <button className="btn-cerrar" onClick={onClose} aria-label="Cerrar modal">
            &times;
          </button>
        </div>

        <form onSubmit={manejarSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alerta error" role="alert">
                <span>{error}</span>
              </div>
            )}

            <div className="filtros-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {/* Selector de Institución Educativa vinculada */}
              <div className="campo-filtro" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="input-inst">Institución Educativa (Tabla Maestra)</label>
                <select
                  id="input-inst"
                  value={institucionId}
                  onChange={(e) => setInstitucionId(e.target.value)}
                  required
                >
                  <option value="">Selecciona una institución...</option>
                  {instituciones.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.nombre} ({inst.municipio}, {inst.departamento}) - DANE: {inst.codigo_dane}
                    </option>
                  ))}
                </select>
              </div>

              {/* Consecutivo del Examen */}
              <div className="campo-filtro">
                <label htmlFor="input-consecutivo">Consecutivo Único</label>
                <input
                  id="input-consecutivo"
                  type="text"
                  value={consecutivo}
                  onChange={(e) => setConsecutivo(e.target.value)}
                  required
                />
              </div>

              {/* Periodo del Examen */}
              <div className="campo-filtro">
                <label htmlFor="input-periodo">Periodo ICFES</label>
                <input
                  id="input-periodo"
                  type="text"
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  placeholder="Ej. 20224"
                  required
                />
              </div>

              {/* Año Lectivo */}
              <div className="campo-filtro">
                <label htmlFor="input-anio">Año de Presentación</label>
                <input
                  id="input-anio"
                  type="number"
                  min="2000"
                  max="2030"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  required
                />
              </div>

              {/* Puntaje Global */}
              <div className="campo-filtro">
                <label htmlFor="input-global">Puntaje Global (0-500)</label>
                <input
                  id="input-global"
                  type="number"
                  min="0"
                  max="500"
                  value={puntajeGlobal}
                  onChange={(e) => setPuntajeGlobal(e.target.value)}
                  required
                />
              </div>

              {/* Puntajes individuales por competencia */}
              <div className="campo-filtro">
                <label htmlFor="input-mat">Matemáticas (0-100)</label>
                <input
                  id="input-mat"
                  type="number"
                  min="0"
                  max="100"
                  value={puntajeMatematicas}
                  onChange={(e) => setPuntajeMatematicas(e.target.value)}
                  required
                />
              </div>

              <div className="campo-filtro">
                <label htmlFor="input-lec">Lectura Crítica (0-100)</label>
                <input
                  id="input-lec"
                  type="number"
                  min="0"
                  max="100"
                  value={puntajeLectura}
                  onChange={(e) => setPuntajeLectura(e.target.value)}
                  required
                />
              </div>

              <div className="campo-filtro">
                <label htmlFor="input-cie">Ciencias Naturales (0-100)</label>
                <input
                  id="input-cie"
                  type="number"
                  min="0"
                  max="100"
                  value={puntajeCiencias}
                  onChange={(e) => setPuntajeCiencias(e.target.value)}
                  required
                />
              </div>

              <div className="campo-filtro">
                <label htmlFor="input-ing">Inglés (0-100)</label>
                <input
                  id="input-ing"
                  type="number"
                  min="0"
                  max="100"
                  value={puntajeIngles}
                  onChange={(e) => setPuntajeIngles(e.target.value)}
                  required
                />
              </div>

              <div className="campo-filtro">
                <label htmlFor="input-soc">Sociales y Ciudadanas (0-100)</label>
                <input
                  id="input-soc"
                  type="number"
                  min="0"
                  max="100"
                  value={puntajeSociales}
                  onChange={(e) => setPuntajeSociales(e.target.value)}
                  required
                />
              </div>

              {/* Campo de auditoría CRUD */}
              <div className="campo-filtro" style={{ gridColumn: 'span 2' }}>
                <label htmlFor="input-obs">Observación de Auditoría</label>
                <textarea
                  id="input-obs"
                  rows="2"
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Justificación del cambio o nota de revisión..."
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--borde)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-accion limpiar" onClick={onClose} disabled={cargando}>
              Cancelar
            </button>
            <button type="submit" className="btn-accion primario" disabled={cargando}>
              {cargando ? 'Guardando en BD...' : resultadoAEditar ? 'Guardar Cambios' : 'Crear Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
