

export default function DetalleModal({ resultado, onClose }) {
  if (!resultado) return null

  // Mapeo de áreas con sus puntajes para renderizado de barras
  const areas = [
    { nombre: 'Matemáticas', puntaje: resultado.puntaje_matematicas, color: '#244b60' },
    { nombre: 'Lectura Crítica', puntaje: resultado.puntaje_lectura, color: '#286982' },
    { nombre: 'Ciencias Naturales', puntaje: resultado.puntaje_ciencias, color: '#28664f' },
    { nombre: 'Inglés', puntaje: resultado.puntaje_ingles, color: '#a96f19' },
    { nombre: 'Sociales y Ciudadanas', puntaje: resultado.puntaje_sociales, color: '#a33d36' },
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="brand-kicker">Ficha Individual Saber 11</span>
            <h3 style={{ margin: '2px 0 0' }}>Examen {resultado.consecutivo}</h3>
          </div>
          <button className="btn-cerrar" onClick={onClose} aria-label="Cerrar modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Tarjeta destacada de puntaje global */}
          <div
            style={{
              background: 'var(--azul-claro)',
              padding: '16px 20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
            <div>
              <span className="kpi-kicker" style={{ color: 'var(--azul)' }}>
                Puntaje Global Consolidado
              </span>
              <div style={{ fontSize: '36px', fontWeight: '800', color: 'var(--azul-oscuro)' }}>
                {resultado.puntaje_global} <span style={{ fontSize: '16px', color: 'var(--texto-suave)' }}>/ 500</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge oficial" style={{ fontSize: '12px' }}>
                Periodo {resultado.periodo}
              </span>
              <div style={{ marginTop: '6px', fontSize: '13px', color: 'var(--texto-suave)' }}>
                Año lectivo: <strong>{resultado.anio}</strong>
              </div>
            </div>
          </div>

          {/* Información de la institución vinculada por llave foránea */}
          <h4 style={{ margin: '0 0 10px', color: 'var(--azul-oscuro)', fontSize: '14px' }}>
            Institución Educativa 
          </h4>
          <div
            style={{
              background: 'var(--superficie-suave)',
              border: '1px solid var(--borde)',
              padding: '14px 18px',
              borderRadius: '6px',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--texto)' }}>
              {resultado.institucion_nombre || 'Institución sin nombre reportado'}
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--texto-suave)' }}>
              <div>DANE: <strong>{resultado.institucion_dane}</strong></div>
              <div>Municipio: <strong>{resultado.municipio}</strong></div>
              <div>Departamento: <strong>{resultado.departamento}</strong></div>
              <div>
                Categoria:{' '}
                <span className={`badge ${resultado.naturaleza === 'OFICIAL' ? 'oficial' : 'no-oficial'}`}>
                  {resultado.naturaleza}
                </span>
              </div>
              <div>
                Zona:{' '}
                <span className={`badge ${resultado.zona === 'RURAL' ? 'rural' : 'urbana'}`}>
                  {resultado.zona}
                </span>
              </div>
            </div>
          </div>

          {/* Barras de desempeño individual por competencia */}
          <h4 style={{ margin: '0 0 12px', color: 'var(--azul-oscuro)', fontSize: '14px' }}>
            Desempeño por Área de Conocimiento (Escala 0 - 100)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {areas.map((a) => (
              <div key={a.nombre}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                  <span style={{ fontWeight: '600' }}>{a.nombre}</span>
                  <span style={{ fontWeight: '700' }}>{a.puntaje} / 100</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(0, a.puntaje))}%`,
                      background: a.color,
                      borderRadius: '4px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Campo de auditoría CRUD */}
          <h4 style={{ margin: '0 0 6px', color: 'var(--azul-oscuro)', fontSize: '14px' }}>
            Observación de Auditoría
          </h4>
          <p
            style={{
              background: '#fff',
              border: '1px solid var(--borde)',
              padding: '10px 14px',
              borderRadius: '6px',
              margin: '0',
              fontSize: '13px',
              color: resultado.observacion ? 'var(--texto)' : 'var(--texto-suave)',
              fontStyle: resultado.observacion ? 'normal' : 'italic',
            }}
          >
            {resultado.observacion || 'Sin observaciones registradas para este registro.'}
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-accion primario" onClick={onClose}>
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  )
}
