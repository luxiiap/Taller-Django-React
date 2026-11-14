import { useState } from 'react'

const ESTILOS = {
  encabezado: {
    borderBottom: '1px solid #dce4e8',
    paddingBottom: '18px',
    marginBottom: '22px',
  },
  kicker: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--celeste)',
    marginBottom: '6px',
  },
  gridDosColumnas: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
    gap: '18px',
    marginBottom: '26px',
  },
  tarjetaInfo: {
    background: 'var(--superficie-suave, #f6f9fa)',
    border: '1px solid #d5dfe3',
    borderRadius: '10px',
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  tarjetaCredenciales: {
    background: '#f2f8f5',
    border: '1px solid #b9d8ca',
    borderTop: '4px solid #28664f',
    borderRadius: '10px',
    padding: '18px 20px',
  },
  tarjetaAutor: {
    background: 'var(--superficie-suave, #f6f9fa)',
    border: '1px solid #d5dfe3',
    borderTop: '4px solid var(--azul-oscuro)',
    borderRadius: '10px',
    padding: '18px 20px',
  },
  tituloTarjeta: {
    margin: '0 0 12px',
    fontSize: '15px',
    color: 'var(--azul-oscuro)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filaDato: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '7px 0',
    borderBottom: '1px dashed #d8e2e6',
    gap: '12px',
    fontSize: '13px',
  },
  etiqueta: {
    color: '#5b6f78',
    fontWeight: 500,
    fontSize: '12px',
  },
  valor: {
    color: 'var(--azul-oscuro)',
    fontWeight: 600,
    textAlign: 'right',
  },
  codigoCredencial: {
    background: '#ffffff',
    border: '1px solid #bfd5cb',
    borderRadius: '6px',
    padding: '3px 9px',
    fontFamily: 'monospace',
    fontSize: '13px',
    fontWeight: 700,
    color: '#1e4d3b',
  },
  botonCopiar: {
    background: '#28664f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  seccionDestacada: {
    background: '#ffffff',
    border: '1px solid #cbd6da',
    borderRadius: '10px',
    padding: '20px 22px',
    marginBottom: '26px',
    boxShadow: '0 2px 6px rgba(18, 44, 58, 0.04)',
  },
  badgeNuevo: {
    display: 'inline-block',
    marginLeft: '10px',
    padding: '2px 10px',
    borderRadius: '999px',
    background: '#28664f',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.07em',
    verticalAlign: 'middle',
  },
  gridPilares: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
    gap: '14px',
    marginTop: '16px',
  },
  pilarCard: {
    background: 'var(--superficie-suave, #f6f9fa)',
    border: '1px solid #dce4e8',
    borderLeft: '3px solid var(--celeste)',
    borderRadius: '8px',
    padding: '14px 16px',
  },
  pilarTitulo: {
    margin: '0 0 6px',
    fontSize: '13.5px',
    color: 'var(--azul-oscuro)',
  },
  pilarTexto: {
    margin: 0,
    fontSize: '12.5px',
    lineHeight: '1.55',
    color: 'var(--texto)',
  },
  tituloSeccion: {
    margin: '0 0 12px',
    color: 'var(--azul-oscuro)',
    fontSize: '15px',
  },
}

export default function AcercaProyecto() {
  const [copiado, setCopiado] = useState('')

  function copiarTexto(texto, clave) {
    navigator.clipboard?.writeText(texto)
    setCopiado(clave)
    setTimeout(() => setCopiado(''), 1800)
  }

  return (
    <div className="acerca-card">
      {/* Encabezado Editorial */}
      <div style={ESTILOS.encabezado}>
        <span style={ESTILOS.kicker}>Documentación y Arquitectura · Saber 11</span>
        <h2 style={{ margin: '0 0 10px' }}>Observatorio de Calidad Educativa (ICFES)</h2>
        <p className="masthead-note" style={{ fontSize: '14.5px', lineHeight: '1.6', margin: 0 }}>
          Plataforma web fullstack diseñada para la consulta, gobernanza y exploración de
          resultados reales del examen nacional de Estado <strong>Saber 11</strong>. Construida
          sobre una arquitectura desacoplada con <strong>Django REST Framework</strong> en el
          backend, <strong>PostgreSQL</strong> como motor relacional y <strong>React</strong> en la
          interfaz de usuario.
        </p>
      </div>

      {/* Fila 1: Autoría + Credenciales lado a lado */}
      <div style={ESTILOS.gridDosColumnas}>
        {/* Tarjeta Autoría */}
        <div style={ESTILOS.tarjetaAutor}>
          <h3 style={ESTILOS.tituloTarjeta}>Autoría del Proyecto</h3>
          <div>
            <div style={ESTILOS.filaDato}>
              <span style={ESTILOS.etiqueta}>Estudiante</span>
              <span style={ESTILOS.valor}>Adriana Lucia Guerrero Cuadros</span>
            </div>
            <div style={ESTILOS.filaDato}>
              <span style={ESTILOS.etiqueta}>Programa</span>
              <span style={ESTILOS.valor}>ADSO · SENA CIMM, Sogamoso</span>
            </div>
            <div style={ESTILOS.filaDato}>
              <span style={ESTILOS.etiqueta}>Taller</span>
              <span style={ESTILOS.valor}>Django + React Fullstack</span>
            </div>
            <div style={{ ...ESTILOS.filaDato, borderBottom: 'none', paddingBottom: 0 }}>
              <span style={ESTILOS.etiqueta}>Modalidad</span>
              <span style={ESTILOS.valor}>Individual · Noviembre 2026</span>
            </div>
          </div>
        </div>

        {/* Tarjeta Credenciales */}
        <div style={ESTILOS.tarjetaCredenciales}>
          <h3 style={{ ...ESTILOS.tituloTarjeta, color: '#1e4d3b' }}>
            <span>Credenciales de Evaluación</span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#28664f' }}>
              Token DRF / Admin
            </span>
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: '#2c473c', lineHeight: '1.5' }}>
            La lectura y búsqueda son públicas. Para probar la <strong>Ingestión Masiva</strong>,
            el CRUD protegido o entrar a <code>/admin/</code>, utilice:
          </p>
          <div>
            <div style={{ ...ESTILOS.filaDato, borderBottomColor: '#c8dfd5' }}>
              <span style={ESTILOS.etiqueta}>Usuario</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={ESTILOS.codigoCredencial}>admin</code>
                <button
                  type="button"
                  style={ESTILOS.botonCopiar}
                  onClick={() => copiarTexto('admin', 'user')}
                >
                  {copiado === 'user' ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
            <div style={{ ...ESTILOS.filaDato, borderBottom: 'none', paddingBottom: 0 }}>
              <span style={ESTILOS.etiqueta}>Contraseña</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <code style={ESTILOS.codigoCredencial}>admin12345</code>
                <button
                  type="button"
                  style={ESTILOS.botonCopiar}
                  onClick={() => copiarTexto('admin12345', 'pass')}
                >
                  {copiado === 'pass' ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fila 2: Funcionalidad Nueva Integrada (3 pilares visuales) */}
      <div style={ESTILOS.seccionDestacada}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--azul-oscuro)' }}>
            Motor de Filtración y Búsqueda Avanzada
          </h3>
          <span style={{ ...ESTILOS.badgeNuevo, marginLeft: 0 }}>FUNCIONALIDAD NUEVA</span>
        </div>

        <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--texto)' }}>
          Como aporte adicional al alcance base del taller, se implementó un{' '}
          <strong>sistema de búsqueda libre y filtrado multidimensional</strong> resuelto
          directamente en el servidor mediante Django ORM, permitiendo localizar y segmentar miles
          de evaluaciones al instante sin penalizar el rendimiento del navegador.
        </p>

        <div style={ESTILOS.gridPilares}>
          <div style={ESTILOS.pilarCard}>
            <h4 style={ESTILOS.pilarTitulo}>1. Búsqueda Textual Libre</h4>
            <p style={ESTILOS.pilarTexto}>
              Localización inmediata mediante el parámetro <code>search</code> por nombre del
              colegio, municipio, código DANE o consecutivo individual del estudiante.
            </p>
          </div>

          <div style={ESTILOS.pilarCard}>
            <h4 style={ESTILOS.pilarTitulo}>2. Segmentación Combinada</h4>
            <p style={ESTILOS.pilarTexto}>
              Cruce simultáneo por <code>departamento</code>, <code>categoria</code> (Oficial / No
              Oficial), <code>zona</code> (Urbana / Rural) y rangos de puntaje global (mínimo y
              máximo).
            </p>
          </div>

          <div style={ESTILOS.pilarCard}>
            <h4 style={ESTILOS.pilarTitulo}>3. Ordenamiento y Paginación</h4>
            <p style={ESTILOS.pilarTexto}>
              Consultas SQL parametrizadas con <code>SearchFilter</code>, ordenamiento dinámico por
              áreas o puntaje y navegación paginada con limpieza rápida de filtros.
            </p>
          </div>
        </div>
      </div>

      {/* Fila 3: Fuente Pública y Stack Tecnológico */}
      <div style={{ ...ESTILOS.gridDosColumnas, marginBottom: 0 }}>
        <div style={ESTILOS.tarjetaInfo}>
          <h3 style={ESTILOS.tituloSeccion}>Fuente Pública Verificable</h3>
          <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--texto)' }}>
            Los microdatos provienen del portal de datos abiertos de Colombia (
            <strong>datos.gov.co</strong>, recurso oficial del ICFES <code>kgxf-xxbe</code>). La
            ingestión masiva normaliza anomalías territoriales, limpia valores nulos e inserta
            registros en bloque con <code>bulk_create</code> sin duplicados, superando los 5.000
            registros disponibles para consulta en vivo.
          </p>
        </div>

        <div style={ESTILOS.tarjetaInfo}>
          <h3 style={ESTILOS.tituloSeccion}>Stack Tecnológico Empleado</h3>
          <div className="tech-pills" style={{ margin: 0 }}>
            <span className="tech-pill">Django 6.1.2 · Python 3.14</span>
            <span className="tech-pill">Django REST Framework 3.18</span>
            <span className="tech-pill">React 19.3 (SPA)</span>
            <span className="tech-pill">Vite 8</span>
            <span className="tech-pill">Recharts 3.10</span>
            <span className="tech-pill">PostgreSQL 18 & Psycopg 3.3</span>
            <span className="tech-pill">Django CORS Headers</span>
            <span className="tech-pill">Socrata SODA API (datos.gov.co)</span>
            <span className="tech-pill">Gunicorn & WhiteNoise (Render)</span>
          </div>
        </div>
      </div>
    </div>
  )
}