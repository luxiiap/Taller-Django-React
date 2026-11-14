import { useState, useEffect } from 'react'
import { dispararIngestion, limpiarResultadosMasivos, obtenerToken, obtenerResumenIngestion } from '../../shared/api'

const STORAGE_KEY_ULTIMA_CARGA = 'saber11_ultima_sincronizacion'

export default function PanelIngestion({ onIngestionCompleta, onAbrirLogin }) {
  const [cantidad, setCantidad] = useState(5000)
  const [periodo, setPeriodo] = useState('20224')
  const [cargando, setCargando] = useState(false)
  const [limpiando, setLimpiando] = useState(false)
  const [informe, setInforme] = useState(null)
  const [error, setError] = useState(null)

  // Estado para cobertura geográfica y última sincronización
  const [cobertura, setCobertura] = useState({
    departamentos: null,
    municipios: null,
  })
  const [ultimaSync, setUltimaSync] = useState(() => {
    try {
      const guardada = localStorage.getItem(STORAGE_KEY_ULTIMA_CARGA)
      return guardada ? JSON.parse(guardada) : null
    } catch {
      return null
    }
  })

  const tokenActivo = obtenerToken()

  // Carga inicial de cobertura geográfica
  async function cargarCobertura() {
    try {
      const { datos } = await obtenerResumenIngestion()
      setCobertura({
        departamentos: datos.departamentos ?? 0,
        municipios: datos.municipios ?? 0,
      })
      if (datos.ultima_sincronizacion) {
        setUltimaSync(datos.ultima_sincronizacion)
      }
    } catch {
      // Si el endpoint aún no responde, mantiene los valores actuales
    }
  }

  useEffect(() => {
    cargarCobertura()
  }, [])

  // Manejador del disparo de ingestión
  async function manejarIngestion(evento) {
    evento.preventDefault()
    setError(null)
    setInforme(null)

    if (!tokenActivo) {
      setError(
        'HTTP 401 Unauthorized · Cerradura de seguridad activa: la ingestión de datos en volumen exige autenticación con Token. Inicia sesión para continuar.'
      )
      onAbrirLogin()
      return
    }

    setCargando(true)
    try {
      const { datos } = await dispararIngestion(parseInt(cantidad, 10), periodo.trim())
      setInforme(datos)

      const ahora = new Date()
      const registroSync = {
        fecha: ahora.toLocaleDateString('es-CO', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        hora: ahora.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        registros: datos.creados_resultados ?? datos.recibidos ?? 0,
        periodo: periodo.trim(),
      }

      setUltimaSync(registroSync)
      localStorage.setItem(STORAGE_KEY_ULTIMA_CARGA, JSON.stringify(registroSync))

      await cargarCobertura()

      if (onIngestionCompleta) onIngestionCompleta()
    } catch (err) {
      if (err.status === 401) {
        setError(
          'HTTP 401 Unauthorized · El servidor rechazó la operación de ingestión porque no se envió un Token de acceso válido.'
        )
        onAbrirLogin()
      } else {
        setError(err.message || 'Error al conectar con la API de datos abiertos.')
      }
    } finally {
      setCargando(false)
    }
  }

  // Manejador de limpieza con una sola confirmación y diseño lineal
  async function manejarLimpieza() {
    setError(null)
    setInforme(null)

    if (!tokenActivo) {
      setError(
        'HTTP 401 Unauthorized · Cerradura de seguridad activa: el vaciado de la base de datos exige autenticación con Token. Inicia sesión para continuar.'
      )
      onAbrirLogin()
      return
    }

    const confirmacion = window.confirm(
      '¿Confirmas la eliminación de todos los registros de resultados de la base de datos?'
    )
    if (!confirmacion) return

    setLimpiando(true)
    try {
      const { datos } = await limpiarResultadosMasivos()
      
      localStorage.removeItem(STORAGE_KEY_ULTIMA_CARGA)
      setUltimaSync(null)
      await cargarCobertura()

      setInforme({
        mensaje_limpieza: datos.mensaje,
        creados_resultados: 0,
        recibidos: 0,
        omitidos_duplicados: 0,
        ms: datos.ms,
        total_resultados: 0,
        total_instituciones: 0,
      })

      if (onIngestionCompleta) onIngestionCompleta()
    } catch (err) {
      if (err.status === 401) {
        setError(
          'HTTP 401 Unauthorized · El servidor rechazó la operación de limpieza porque no se envió un Token de acceso válido.'
        )
        onAbrirLogin()
      } else {
        setError(err.message || 'Error al limpiar la base de datos.')
      }
    } finally {
      setLimpiando(false)
    }
  }

  return (
    <div className="acerca-card">
      <h2>Ingestión Masiva de Microdatos Saber 11 (ICFES)</h2>

      {!tokenActivo && (
        <div className="alerta info">
          <span>
            <strong>Operación Protegida:</strong> Para ejecutar la sincronización masiva o la limpieza debes
            iniciar sesión con credenciales de Django.
          </span>
          <button
            type="button"
            className="btn-auth"
            style={{ marginLeft: '12px', padding: '4px 10px' }}
            onClick={onAbrirLogin}
          >
            Iniciar Sesión
          </button>
        </div>
      )}

      {error && (
        <div className="alerta error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* Formulario alineado de forma totalmente lineal */}
      <form onSubmit={manejarIngestion} style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', color: 'var(--azul-oscuro)' }}>
              Cantidad de Registros
            </label>
            <input
              type="number"
              min="500"
              max="20000"
              step="500"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--borde)', height: '38px', fontSize: '13.5px' }}
            />
          </div>

          <div style={{ flex: '1 1 140px' }}>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '6px', color: 'var(--azul-oscuro)' }}>
              Periodo ICFES
            </label>
            <input
              type="text"
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              placeholder="Ej. 20224"
              required
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--borde)', height: '38px', fontSize: '13.5px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={cargando || limpiando}
              style={{
                background: 'var(--azul-oscuro)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0 16px',
                height: '38px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: cargando || limpiando ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {cargando ? 'Sincronizando...' : 'Disparar Ingestión Masiva'}
            </button>

            <button
              type="button"
              onClick={manejarLimpieza}
              disabled={cargando || limpiando}
              style={{
                background: '#b91c1c',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '0 16px',
                height: '38px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                opacity: cargando || limpiando ? 0.7 : 1,
                whiteSpace: 'nowrap',
              }}
              title="Vaciar toda la base de datos de resultados"
            >
              {limpiando ? 'Depurando...' : 'Limpiar BD'}
            </button>
          </div>
        </div>
      </form>

      {/* Bloque 1: Cobertura geográfica y última sincronización */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', marginBottom: '12px', color: 'var(--texto-suave)' }}>
          Estado de Cobertura y Última Sincronización
        </h3>
        <div className="kpi-grid" style={{ marginBottom: 0 }}>
          <div className="kpi-card">
            <span className="kpi-kicker">Departamentos Almacenados</span>
            <span className="kpi-valor" style={{ color: 'var(--celeste)' }}>
              {cobertura.departamentos !== null ? cobertura.departamentos.toLocaleString() : '—'}
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-kicker">Municipios Almacenados</span>
            <span className="kpi-valor" style={{ color: 'var(--celeste)' }}>
              {cobertura.municipios !== null ? cobertura.municipios.toLocaleString() : '—'}
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-kicker">Última Sincronización</span>
            {ultimaSync ? (
              <>
                <span className="kpi-valor" style={{ fontSize: '18px' }}>
                  +{ultimaSync.registros?.toLocaleString()} reg.
                </span>
                <span style={{ fontSize: '12px', color: 'var(--texto-suave)', marginTop: '4px' }}>
                  {ultimaSync.fecha} · {ultimaSync.hora} (Per. {ultimaSync.periodo})
                </span>
              </>
            ) : (
              <span className="kpi-valor" style={{ fontSize: '16px', color: 'var(--texto-suave)' }}>
                Sin cargas recientes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bloque 2: Resumen devuelto por Django */}
      <div
        style={{
          background: 'var(--superficie-suave)',
          border: informe ? '2px solid var(--verde)' : '1px solid var(--borde, #dce3e8)',
          borderRadius: 'var(--radio)',
          padding: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <h3 style={{ margin: 0, color: informe ? 'var(--verde)' : 'var(--texto)' }}>
            {informe?.mensaje_limpieza
              ? '✓ Limpieza Ejecutada (Django)'
              : informe
              ? '✓ Resumen de Ejecución ETL (Django)'
              : cargando
              ? 'Procesando lote desde Datos Abiertos...'
              : limpiando
              ? 'Depurando base de datos...'
              : 'Resumen de Ejecución ETL (En espera)'}
          </h3>

          {informe && informe.por_segundo && (
            <span
              style={{
                background: 'var(--verde-claro)',
                color: 'var(--verde)',
                fontWeight: '700',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '13px',
              }}
            >
              {informe.por_segundo} filas/segundo
            </span>
          )}
        </div>

        <div className="kpi-grid" style={{ marginBottom: 0 }}>
          <div className="kpi-card">
            <span className="kpi-kicker">Registros Descargados</span>
            <span className="kpi-valor">
              {informe ? informe.recibidos?.toLocaleString() : '—'}
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-kicker">Registros Nuevos Guardados</span>
            <span className="kpi-valor" style={{ color: 'var(--verde)' }}>
              {informe ? informe.creados_resultados?.toLocaleString() : '—'}
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-kicker">Duplicados Omitidos</span>
            <span className="kpi-valor" style={{ color: 'var(--texto-suave)' }}>
              {informe ? informe.omitidos_duplicados?.toLocaleString() : '—'}
            </span>
          </div>

          <div className="kpi-card">
            <span className="kpi-kicker">Tiempo Total de Ejecución</span>
            <span className="kpi-valor" style={{ color: 'var(--celeste)' }}>
              {informe ? `${(informe.ms / 1000).toFixed(2)} s` : '—'}
            </span>
          </div>
        </div>

        <div style={{ marginTop: '14px', fontSize: '13px', color: 'var(--texto-suave)' }}>
          {informe ? (
            <>
              {informe.mensaje_limpieza ? (
                <span style={{ color: '#b91c1c', fontWeight: 600 }}>{informe.mensaje_limpieza}</span>
              ) : (
                <>
                  Instituciones nuevas creadas: <strong>{informe.creados_instituciones?.toLocaleString()}</strong> ·{' '}
                  Total acumulado en BD: <strong>{informe.total_resultados?.toLocaleString()} resultados</strong> en{' '}
                  <strong>{informe.total_instituciones?.toLocaleString()} colegios</strong>.
                </>
              )}
            </>
          ) : (
            'Selecciona la cantidad de registros y el periodo ICFES para iniciar la descarga y ver las métricas del proceso.'
          )}
        </div>
      </div>
    </div>
  )
}