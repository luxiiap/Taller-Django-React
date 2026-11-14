
import { useCallback, useEffect, useState } from 'react'

import LoginModal from '../features/autenticacion/LoginModal'
import DetalleModal from '../features/explorador/DetalleModal'
import FiltrosExplorador from '../features/explorador/FiltrosExplorador'
import ResultadoModal from '../features/explorador/ResultadoModal'
import TablaResultados from '../features/explorador/TablaResultados'
import TableroEstadisticas from '../features/estadisticas/TableroEstadisticas'
import PanelIngestion from '../features/ingestion/PanelIngestion'
import AcercaProyecto from '../features/acerca/AcercaProyecto'

import {
  cerrarSesion,
  consultarEstadoSistema,
  eliminarResultado,
  listarResultados,
  obtenerEstadisticas,
  obtenerToken,
  obtenerUsuarioActual,
} from '../shared/api'

export default function App() {
  const [tabActiva, setTabActiva] = useState('explorador')

  // Estado de autenticación del usuario
  const [usuario, setUsuario] = useState(obtenerUsuarioActual())
  const [token, setToken] = useState(obtenerToken())
  const [modalLoginAbierto, setModalLoginAbierto] = useState(false)

  // Alerta transitoria para mensajes de éxito o advertencias HTTP 401
  const [alerta, setAlerta] = useState(null)

  // Estado de la tabla de explorador de resultados
  const [resultados, setResultados] = useState([])
  const [totalRegistros, setTotalRegistros] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [paginaActual, setPaginaActual] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [ordenActual, setOrdenActual] = useState('-puntaje_global')
  const [filtros, setFiltros] = useState({})
  const [cargandoResultados, setCargandoResultados] = useState(false)

  // Estado del tablero analítico
  const [estadisticas, setEstadisticas] = useState(null)
  const [cargandoEstadisticas, setCargandoEstadisticas] = useState(false)

  // Estado del diagnóstico del sistema
  const [estadoSistema, setEstadoSistema] = useState(null)

  // Estados de modales de visualización y edición
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null)
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false)
  const [resultadoAEditar, setResultadoAEditar] = useState(null)

  // ==============================================================================
  // CARGA DE DATOS: Listado Paginado de Resultados (Explorador)
  // ==============================================================================
  const cargarResultados = useCallback(async () => {
    setCargandoResultados(true)
    try {
      const parametros = {
        ...filtros,
        page: paginaActual,
        page_size: pageSize,
        ordering: ordenActual,
      }
      const { datos } = await listarResultados(parametros)
      if (datos) {
        setResultados(datos.results || [])
        setTotalRegistros(datos.count || 0)
        setTotalPaginas(datos.total_paginas || 1)
      }
    } catch (err) {
      setAlerta({
        tipo: 'error',
        mensaje: `Error al cargar resultados: ${err.message}`,
      })
    } finally {
      setCargandoResultados(false)
    }
  }, [filtros, paginaActual, pageSize, ordenActual])

  // CARGA DE DATOS: Estadísticas Dinámicas con ORM
  const cargarEstadisticas = useCallback(async () => {
    setCargandoEstadisticas(true)
    try {
      const { datos } = await obtenerEstadisticas(filtros)
      setEstadisticas(datos)
    } catch (err) {
      setAlerta({
        tipo: 'error',
        mensaje: `Error al calcular estadísticas en el ORM: ${err.message}`,
      })
    } finally {
      setCargandoEstadisticas(false)
    }
  }, [filtros])

  // CARGA DE DATOS: Diagnóstico Inicial de Base de Datos
  const cargarEstadoSistema = useCallback(async () => {
    try {
      const { datos } = await consultarEstadoSistema()
      setEstadoSistema(datos)
    } catch {
    }
  }, [])

  useEffect(() => {
    cargarResultados()
  }, [cargarResultados])

  useEffect(() => {
    cargarEstadisticas()
  }, [cargarEstadisticas])

  useEffect(() => {
    cargarEstadoSistema()
  }, [cargarEstadoSistema])

  // MANEJADORES DE FILTROS Y ORDENAMIENTO
  function manejarAplicarFiltros(nuevosFiltros) {
    setFiltros(nuevosFiltros)
    setPaginaActual(1) 
  }

  function manejarCambiarOrden(nuevoOrden) {
    setOrdenActual(nuevoOrden)
    setPaginaActual(1)
  }

  // MANEJADORES DE ACCIONES CRUD PROTEGIDAS (POST / PATCH / DELETE)
  function manejarAbrirNuevo() {
    setResultadoAEditar(null)
    setModalFormularioAbierto(true)
  }

  function manejarAbrirEditar(resultado) {
    setResultadoAEditar(resultado)
    setModalFormularioAbierto(true)
  }

  async function manejarEliminar(resultado) {
    const confirmacion = window.confirm(
      `¿Confirmas la eliminación del examen ${resultado.consecutivo} de ${resultado.institucion_nombre}?`
    )
    if (!confirmacion) return

    try {
      await eliminarResultado(resultado.id)
      setAlerta({
        tipo: 'exito',
        mensaje: `✓ Examen ${resultado.consecutivo} eliminado exitosamente.`,
      })
      cargarResultados()
      cargarEstadisticas()
      cargarEstadoSistema()
    } catch (err) {
      if (err.status === 401) {
        setAlerta({
          tipo: 'error',
          mensaje:
            'HTTP 401 Unauthorized · Cerradura de seguridad activa: la eliminación de registros exige autenticación con Token. Inicia sesión para autorizar la acción.',
        })
        setModalLoginAbierto(true)
      } else {
        setAlerta({
          tipo: 'error',
          mensaje: `Error al eliminar el registro: ${err.message}`,
        })
      }
    }
  }

  function manejarGuardadoExitoso() {
    setAlerta({
      tipo: 'exito',
      mensaje: '✓ Registro procesado y guardado correctamente en la base de datos.',
    })
    cargarResultados()
    cargarEstadisticas()
    cargarEstadoSistema()
  }

  // GESTIÓN DE SESIÓN Y TOKENS
  function manejarLoginExitoso(datosUsuario, nuevoToken) {
    setUsuario(datosUsuario)
    setToken(nuevoToken)
    setAlerta({
      tipo: 'exito',
      mensaje: `✓ Sesión iniciada como "${datosUsuario.username}". Token de autorización activo en cabeceras.`,
    })
  }

  function manejarLogout() {
    cerrarSesion()
    setUsuario(null)
    setToken(null)
    setAlerta({
      tipo: 'info',
      mensaje: 'Sesión cerrada. Ahora estás en modo de lectura pública.',
    })
  }

  return (
    <div className="app-shell">
      {/* Cabecera Principal del Observatorio */}
      <header className="masthead">
        <div className="marca">
          <p className="brand-kicker">Ministerio de Educación · ICFES Colombia</p>
          <h1>Observatorio de Calidad Educativa</h1>
          
        </div>

        {/* Controles de Autenticación y Token */}
        <div className="masthead-controls">
          {estadoSistema && (
            <div
              style={{
                fontSize: '12px',
                color: 'var(--texto-suave)',
                background: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--borde)',
              }}
            >
              BD: <strong>{estadoSistema.total_resultados?.toLocaleString()} registros</strong>
            </div>
          )}

          {token && usuario ? (
            <div className="auth-badge">
              <span>
                Conectado como: <strong>{usuario.username}</strong>
              </span>
              <button
                type="button"
                className="btn-auth secundario"
                onClick={manejarLogout}
                title="Cerrar sesión y retirar token"
              >
                Salir
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn-auth"
              onClick={() => setModalLoginAbierto(true)}
            >
              Iniciar Sesión (Token)
            </button>
          )}
        </div>
      </header>

      <nav className="nav-tabs" aria-label="Navegación principal">
        <button
          type="button"
          className={`nav-tab-btn ${tabActiva === 'explorador' ? 'activa' : ''}`}
          onClick={() => setTabActiva('explorador')}
        >
          <span></span> Explorador Saber 11
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${tabActiva === 'estadisticas' ? 'activa' : ''}`}
          onClick={() => setTabActiva('estadisticas')}
        >
          <span></span> Tablero Analítico (ORM)
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${tabActiva === 'ingestion' ? 'activa' : ''}`}
          onClick={() => setTabActiva('ingestion')}
        >
          <span></span> Ingestión Masiva
        </button>

        <button
          type="button"
          className={`nav-tab-btn ${tabActiva === 'acerca' ? 'activa' : ''}`}
          onClick={() => setTabActiva('acerca')}
        >
          <span></span> Acerca del Proyecto
        </button>
      </nav>

      {/* Banner de alerta interactivo */}
      {alerta && (
        <div className={`alerta ${alerta.tipo}`} role="alert">
          <span>{alerta.mensaje}</span>
          <button
            type="button"
            className="btn-cerrar"
            style={{ fontSize: '16px' }}
            onClick={() => setAlerta(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/* Vistas Principales según Pestaña Activa */}
      <main>
        {tabActiva === 'explorador' && (
          <div>
            <FiltrosExplorador
              filtrosActuales={filtros}
              onAplicarFiltros={manejarAplicarFiltros}
              onNuevoRegistro={manejarAbrirNuevo}
            />

            <TablaResultados
              resultados={resultados}
              totalRegistros={totalRegistros}
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              pageSize={pageSize}
              cargando={cargandoResultados}
              ordenActual={ordenActual}
              onCambiarOrden={manejarCambiarOrden}
              onCambiarPagina={(nuevaPag) => setPaginaActual(nuevaPag)}
              onCambiarPageSize={(nuevoTamano) => {
                setPageSize(nuevoTamano)
                setPaginaActual(1)
              }}
              onVerDetalle={(res) => setDetalleSeleccionado(res)}
              onEditar={manejarAbrirEditar}
              onEliminar={manejarEliminar}
            />
          </div>
        )}

        {tabActiva === 'estadisticas' && (
          <div>
            <TableroEstadisticas
              estadisticas={estadisticas}
              cargando={cargandoEstadisticas}
            />
          </div>
        )}

        {tabActiva === 'ingestion' && (
          <div>
            <PanelIngestion
              onIngestionCompleta={() => {
                cargarResultados()
                cargarEstadisticas()
                cargarEstadoSistema()
              }}
              onAbrirLogin={() => setModalLoginAbierto(true)}
            />
          </div>
        )}

        {tabActiva === 'acerca' && (
          <div>
            <AcercaProyecto />
          </div>
        )}
      </main>

      {/* Modales Flotantes */}
      <LoginModal
        isOpen={modalLoginAbierto}
        onClose={() => setModalLoginAbierto(false)}
        onLoginExitoso={manejarLoginExitoso}
      />

      <DetalleModal
        resultado={detalleSeleccionado}
        onClose={() => setDetalleSeleccionado(null)}
      />

      <ResultadoModal
        isOpen={modalFormularioAbierto}
        resultadoAEditar={resultadoAEditar}
        onClose={() => setModalFormularioAbierto(false)}
        onGuardadoExitoso={manejarGuardadoExitoso}
        onExigeAutenticacion={() => setModalLoginAbierto(true)}
      />
    </div>
  )
}
