/**
 * TablaResultados.jsx - Componente de presentación tabular de datos Saber 11 en volumen.
 *
 * Muestra el listado de registros con:
 * - Columnas ordenables por puntajes y años que disparan consultas SQL en Django
 * - Distintivos visuales para naturaleza (OFICIAL / NO OFICIAL) y zona (URBANA / RURAL)
 * - Botones de acción individual por fila (Ver Detalle, Editar, Eliminar)
 * - Barra de paginación completa con selector de tamaño de página (?page_size=)
 */

export default function TablaResultados({
  resultados,
  totalRegistros,
  paginaActual,
  totalPaginas,
  pageSize,
  cargando,
  ordenActual,
  onCambiarOrden,
  onCambiarPagina,
  onCambiarPageSize,
  onVerDetalle,
  onEditar,
  onEliminar,
}) {
  // Función auxiliar para determinar el ícono de ordenamiento en los encabezados
  function renderIndicadorOrden(campo) {
    if (ordenActual === campo) return ' ▲'
    if (ordenActual === `-${campo}`) return ' ▼'
    return ' ⇅'
  }

  // Alterna entre orden ascendente, descendente y default
  function toggleOrden(campo) {
    if (ordenActual === `-${campo}`) {
      onCambiarOrden(campo)
    } else {
      onCambiarOrden(`-${campo}`)
    }
  }

  const inicioFila = totalRegistros > 0 ? (paginaActual - 1) * pageSize + 1 : 0
  const finFila = Math.min(paginaActual * pageSize, totalRegistros)

  return (
    <div className="tabla-wrapper">
      <div className="tabla-header-bar">
        <h2>Listado de Evaluaciones ICFES Saber 11</h2>
        <div style={{ fontSize: '13px', color: 'var(--texto-suave)' }}>
          {cargando ? (
            <span>Consultando en PostgreSQL...</span>
          ) : (
            <span>
              Total en base de datos: <strong>{totalRegistros.toLocaleString()}</strong> registros
            </span>
          )}
        </div>
      </div>

      <div className="tabla-scroll">
        <table className="datos-tabla">
          <thead>
            <tr>
              <th>Consecutivo</th>
              <th>Institución Educativa (DANE)</th>
              <th>Ubicación</th>
              <th>Naturaleza</th>
              <th>Zona</th>
              <th className="sortable" onClick={() => toggleOrden('anio')}>
                Año {renderIndicadorOrden('anio')}
              </th>
              <th
                className="sortable"
                onClick={() => toggleOrden('puntaje_global')}
                style={{ textAlign: 'right' }}
              >
                Puntaje Global {renderIndicadorOrden('puntaje_global')}
              </th>
              <th style={{ textAlign: 'center' }}>Mat / Lec / Cie / Ing</th>
              <th>Observación</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--texto-suave)' }}>
                  Cargando página desde el backend Django...
                </td>
              </tr>
            ) : resultados.length === 0 ? (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: 'var(--texto-suave)' }}>
                  No se encontraron resultados que coincidan con los filtros aplicados.
                </td>
              </tr>
            ) : (
              resultados.map((res) => (
                <tr key={res.id}>
                  {/* Consecutivo del examen */}
                  <td style={{ fontFamily: 'monospace', fontWeight: '600', fontSize: '12px' }}>
                    {res.consecutivo}
                  </td>

                  {/* Nombre y código DANE del colegio */}
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--azul-oscuro)' }}>
                      {res.institucion_nombre || 'Sin nombre'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--texto-suave)' }}>
                      DANE: {res.institucion_dane}
                    </div>
                  </td>

                  {/* Municipio y Departamento */}
                  <td>
                    <div>{res.municipio}</div>
                    <div style={{ fontSize: '11px', color: 'var(--texto-suave)' }}>{res.departamento}</div>
                  </td>

                  {/* Badge de naturaleza jurídica */}
                  <td>
                    <span
                      className={`badge ${res.naturaleza === 'OFICIAL' ? 'oficial' : 'no-oficial'}`}
                    >
                      {res.naturaleza}
                    </span>
                  </td>

                  {/* Badge de zona territorial */}
                  <td>
                    <span className={`badge ${res.zona === 'RURAL' ? 'rural' : 'urbana'}`}>
                      {res.zona}
                    </span>
                  </td>

                  {/* Año y periodo */}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <strong>{res.anio}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--texto-suave)' }}>{res.periodo}</div>
                  </td>

                  {/* Puntaje global destacado */}
                  <td style={{ textAlign: 'right' }}>
                    <span className="puntaje-destacado" style={{ fontSize: '15px' }}>
                      {res.puntaje_global}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--texto-suave)' }}> / 500</span>
                  </td>

                  {/* Desglose resumido de componentes individuales */}
                  <td style={{ textAlign: 'center', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    <span title="Matemáticas">{res.puntaje_matematicas}</span> |{' '}
                    <span title="Lectura Crítica">{res.puntaje_lectura}</span> |{' '}
                    <span title="Ciencias Naturales">{res.puntaje_ciencias}</span> |{' '}
                    <span title="Inglés">{res.puntaje_ingles}</span>
                  </td>

                  {/* Campo de auditoría CRUD */}
                  <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--texto-suave)' }}>
                    {res.observacion || '—'}
                  </td>

                  {/* Acciones individuales por fila */}
                  <td>
                    <div className="fila-acciones" style={{ justifyContent: 'center' }}>
                      <button
                        type="button"
                        className="btn-fila"
                        title="Ver ficha completa"
                        onClick={() => onVerDetalle(res)}
                      >
                        Ver
                      </button>
                      <button
                        type="button"
                        className="btn-fila"
                        title="Editar registro (Requiere Token)"
                        onClick={() => onEditar(res)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-fila peligro"
                        title="Eliminar registro (Requiere Token)"
                        onClick={() => onEliminar(res)}
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Barra de paginación interactiva */}
      <div className="paginacion-bar">
        <div className="paginacion-info">
          Mostrando <strong>{inicioFila}</strong> - <strong>{finFila}</strong> de{' '}
          <strong>{totalRegistros.toLocaleString()}</strong> resultados (Página {paginaActual} de {totalPaginas || 1})
        </div>

        <div className="paginacion-controles">
          <label style={{ fontSize: '12px', color: 'var(--texto-suave)' }}>
            Filas por página:
            <select
              value={pageSize}
              onChange={(e) => onCambiarPageSize(parseInt(e.target.value, 10))}
              style={{
                marginLeft: '6px',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--borde)',
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>

          <button
            type="button"
            className="btn-pagina"
            disabled={paginaActual <= 1 || cargando}
            onClick={() => onCambiarPagina(1)}
            title="Primera página"
          >
            « Inicio
          </button>
          <button
            type="button"
            className="btn-pagina"
            disabled={paginaActual <= 1 || cargando}
            onClick={() => onCambiarPagina(paginaActual - 1)}
            title="Página anterior"
          >
            ‹ Anterior
          </button>
          <span style={{ fontWeight: '700', padding: '0 6px' }}>{paginaActual}</span>
          <button
            type="button"
            className="btn-pagina"
            disabled={paginaActual >= totalPaginas || cargando}
            onClick={() => onCambiarPagina(paginaActual + 1)}
            title="Página siguiente"
          >
            Siguiente ›
          </button>
          <button
            type="button"
            className="btn-pagina"
            disabled={paginaActual >= totalPaginas || cargando}
            onClick={() => onCambiarPagina(totalPaginas)}
            title="Última página"
          >
            Final »
          </button>
        </div>
      </div>
    </div>
  )
}
