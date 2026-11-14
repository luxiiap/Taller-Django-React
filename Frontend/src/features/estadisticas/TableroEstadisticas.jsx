
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const ESTILO_TOOLTIP = {
  background: '#ffffff',
  border: '1px solid #cbd6da',
  borderRadius: '6px',
  fontSize: '12px',
}

const ESTILO_KPI_GRID = {
  display: 'grid',
  gridAutoFlow: 'column',
  gridAutoColumns: 'minmax(135px, 1fr)',
  gap: '12px',
  overflowX: 'auto',
  paddingBottom: '6px',
  marginBottom: '24px',
}

const ESTILO_KPI_CARD = {
  minWidth: 0,
  padding: '14px 14px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '4px',
}

const ESTILO_KPI_KICKER = {
  fontSize: '0.68rem',
  lineHeight: 1.25,
  minHeight: '2.5em', 
}

const ESTILO_KPI_VALOR = {
  fontSize: '1.7rem',
  lineHeight: 1.1,
}

const ESTILO_KPI_NOTA = {
  fontSize: '0.75rem',
  lineHeight: 1.3,
}

// Grid de gráficas: 2 columnas con alturas uniformes
const ESTILO_GRAFICAS_GRID = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '20px',
  alignItems: 'stretch',
}

const ANCHO_COMPLETO = { gridColumn: '1 / -1' }

export default function TableroEstadisticas({ estadisticas, cargando }) {
  if (cargando || !estadisticas) {
    return (
      <div className="tabla-wrapper" style={{ padding: '48px', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--azul-oscuro)' }}>Calculando agregaciones con Django ORM...</h3>
        <p className="masthead-note">
          Ejecutando consultas SQL aggregate y annotate en el motor de base de datos.
        </p>
      </div>
    )
  }

  const { kpis, por_departamento_naturaleza, por_anio_zona, por_naturaleza, promedios_por_area, tiempo_calculo_ms } =
    estadisticas

  // Paleta de colores para las barras
  const COLORES_AREAS = ['#244b60', '#286982', '#28664f', '#a96f19', '#a33d36']

  // Etiquetas combinadas para distinguir barras que repiten el mismo departamento / zona
  const datosDepartamento = (por_departamento_naturaleza || []).slice(0, 14).map((d) => ({
    ...d,
    etiqueta: `${d.departamento} · ${d.naturaleza}`,
  }))

  const datosAnioZona = (por_anio_zona || []).map((d) => ({
    ...d,
    etiqueta: `${d.zona} · ${d.anio}`,
  }))

  return (
    <div>
      
      {/* Fila única de Tarjetas KPI */}
      <div className="kpi-grid" style={ESTILO_KPI_GRID}>
        <div className="kpi-card" style={ESTILO_KPI_CARD}>
          <span className="kpi-kicker" style={ESTILO_KPI_KICKER}>Volumen Total</span>
          <span className="kpi-valor" style={ESTILO_KPI_VALOR}>{(kpis.total_evaluados || 0).toLocaleString()}</span>
          <span className="kpi-nota" style={ESTILO_KPI_NOTA}>Estudiantes evaluados</span>
        </div>

        <div className="kpi-card" style={ESTILO_KPI_CARD}>
          <span className="kpi-kicker" style={ESTILO_KPI_KICKER}>Promedio Global</span>
          <span className="kpi-valor" style={ESTILO_KPI_VALOR}>{kpis.promedio_global}</span>
          <span className="kpi-nota" style={ESTILO_KPI_NOTA}>Sobre 500 puntos posibles</span>
        </div>

        <div className="kpi-card" style={ESTILO_KPI_CARD}>
          <span className="kpi-kicker" style={ESTILO_KPI_KICKER}>Puntaje Máximo</span>
          <span className="kpi-valor" style={{ ...ESTILO_KPI_VALOR, color: 'var(--verde)' }}>
            {kpis.maximo_global}
          </span>
          <span className="kpi-nota" style={ESTILO_KPI_NOTA}>Mejor resultado nacional</span>
        </div>

        <div className="kpi-card" style={ESTILO_KPI_CARD}>
          <span className="kpi-kicker" style={ESTILO_KPI_KICKER}>Prom. Matemáticas</span>
          <span className="kpi-valor" style={{ ...ESTILO_KPI_VALOR, color: '#244b60' }}>
            {kpis.promedio_matematicas}
          </span>
          <span className="kpi-nota" style={ESTILO_KPI_NOTA}>Sobre 100 puntos</span>
        </div>

        <div className="kpi-card" style={ESTILO_KPI_CARD}>
          <span className="kpi-kicker" style={ESTILO_KPI_KICKER}>Prom. Lectura Crítica</span>
          <span className="kpi-valor" style={{ ...ESTILO_KPI_VALOR, color: '#286982' }}>
            {kpis.promedio_lectura}
          </span>
          <span className="kpi-nota" style={ESTILO_KPI_NOTA}>Sobre 100 puntos</span>
        </div>

        <div className="kpi-card" style={ESTILO_KPI_CARD}>
          <span className="kpi-kicker" style={ESTILO_KPI_KICKER}>Prom. Ciencias Naturales</span>
          <span className="kpi-valor" style={{ ...ESTILO_KPI_VALOR, color: '#28664f' }}>
            {kpis.promedio_ciencias}
          </span>
          <span className="kpi-nota" style={ESTILO_KPI_NOTA}>Sobre 100 puntos</span>
        </div>

        <div className="kpi-card" style={ESTILO_KPI_CARD}>
          <span className="kpi-kicker" style={ESTILO_KPI_KICKER}>Prom. Inglés</span>
          <span className="kpi-valor" style={{ ...ESTILO_KPI_VALOR, color: '#a96f19' }}>
            {kpis.promedio_ingles}
          </span>
          <span className="kpi-nota" style={ESTILO_KPI_NOTA}>Sobre 100 puntos</span>
        </div>

        <div className="kpi-card" style={ESTILO_KPI_CARD}>
          <span className="kpi-kicker" style={ESTILO_KPI_KICKER}>Prom. Sociales y Ciudadanas</span>
          <span className="kpi-valor" style={{ ...ESTILO_KPI_VALOR, color: '#a33d36' }}>
            {kpis.promedio_sociales}
          </span>
          <span className="kpi-nota" style={ESTILO_KPI_NOTA}>Sobre 100 puntos</span>
        </div>
      </div>

      {/* Grid de Gráficas Analíticas con Recharts */}
      <div className="graficas-grid" style={ESTILO_GRAFICAS_GRID}>
        {/* FILA 1 (ancho completo) - GRÁFICA 1: Promedio Global por Departamento y Naturaleza */}
        <div className="grafica-card" style={ANCHO_COMPLETO}>
          <h3>Dimensión 1: Puntaje Global por Departamento y Naturaleza</h3>
          
          <div style={{ height: '380px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={datosDepartamento}
                margin={{ top: 10, right: 20, left: 0, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd6da" vertical={false} />
                <XAxis
                  dataKey="etiqueta"
                  angle={-30}
                  textAnchor="end"
                  tick={{ fontSize: 11, fill: '#192d38' }}
                  interval={0}
                  height={90}
                />
                <YAxis domain={[0, 500]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(valor, name) => [`${valor} pts`, name]}
                  labelFormatter={(etiqueta, items) => {
                    const item = items && items[0] && items[0].payload
                    return item
                      ? `${item.departamento} (${item.naturaleza}) - ${item.conteo} evaluados`
                      : etiqueta
                  }}
                  contentStyle={ESTILO_TOOLTIP}
                />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                <Bar
                  dataKey="promedio_global"
                  name="Puntaje Global Promedio"
                  fill="#244b60"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="max_global"
                  name="Puntaje Máximo Departamento"
                  fill="#a96f19"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FILA 2 (mitad y mitad) - GRÁFICA 2: Comparativa Oficial vs No Oficial */}
        <div className="grafica-card">
          <h3>Comparativa por Naturaleza Jurídica</h3>
          <p className="grafica-subtitulo">
            Contraste entre Colegios Oficiales (Públicos) y No Oficiales (Privados).
          </p>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={por_naturaleza} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd6da" vertical={false} />
                <XAxis dataKey="naturaleza" tick={{ fontSize: 12, fontWeight: '700' }} />
                <YAxis domain={[0, 350]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`${val} pts`]}
                  contentStyle={ESTILO_TOOLTIP}
                />
                <Legend verticalAlign="top" />
                <Bar dataKey="promedio_global" name="Promedio Global" fill="#28664f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="promedio_mat" name="Matemáticas" fill="#244b60" radius={[4, 4, 0, 0]} />
                <Bar dataKey="promedio_lec" name="Lectura Crítica" fill="#286982" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FILA 2 (mitad y mitad) - GRÁFICA 3: Desempeño por Áreas de Conocimiento */}
        <div className="grafica-card">
          <h3>Promedios por Área de Conocimiento</h3>
          <p className="grafica-subtitulo">
            Desempeño medio en cada uno de los 5 núcleos evaluados (Escala 0 a 100).
          </p>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={promedios_por_area}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd6da" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="area" type="category" width={140} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val) => [`${val} / 100 pts`, 'Promedio']}
                  contentStyle={ESTILO_TOOLTIP}
                />
                <Bar dataKey="promedio" name="Puntaje Medio" radius={[0, 4, 4, 0]}>
                  {promedios_por_area.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORES_AREAS[index % COLORES_AREAS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

                {/* FILA 3 (ancho completo) - GRÁFICA 4: Comparativa por Año y Zona Geográfica */}
        <div className="grafica-card" style={ANCHO_COMPLETO}>
          <h3>Dimensión 2: Comportamiento por Año y Zona Geográfica (Urbana vs Rural)</h3>
          
          <div style={{ height: '420px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosAnioZona} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd6da" vertical={false} />
                <XAxis
                  dataKey="etiqueta"
                  angle={-60}
                  textAnchor="end"
                  interval={0}
                  height={100}
                  tick={{ fontSize: 10, fontWeight: '600', fill: '#192d38' }}
                />
                <YAxis domain={[0, 500]} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val, name, item) => [
                    `${val} pts (${item.payload.conteo} evaluados)`,
                    `${name} - Año ${item.payload.anio}`,
                  ]}
                  contentStyle={ESTILO_TOOLTIP}
                />
                <Legend verticalAlign="top" />
                <Bar dataKey="promedio_global" name="Promedio Global por Zona" fill="#286982" radius={[4, 4, 0, 0]} />
                <Bar dataKey="max_global" name="Puntaje Máximo Zona" fill="#a96f19" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}