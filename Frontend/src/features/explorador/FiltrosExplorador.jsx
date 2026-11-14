
import { useState } from 'react'

const DEPARTAMENTOS_COMUNES = [
  'TODOS',
  'AMAZONAS',
  'ANTIOQUIA',
  'ARAUCA',
  'ATLANTICO',
  'BOGOTA',
  'BOLIVAR',
  'BOYACA',
  'CALDAS',
  'CAQUETA',
  'CASANARE',
  'CAUCA',
  'CESAR',
  'CHOCO',
  'CORDOBA',
  'CUNDINAMARCA',
  'GUAINIA',
  'GUAVIARE',
  'HUILA',
  'LA GUAJIRA',
  'MAGDALENA',
  'META',
  'NARINO',
  'NORTE SANTANDER',
  'PUTUMAYO',
  'QUINDIO',
  'RISARALDA',
  'SAN ANDRES',
  'SANTANDER',
  'SUCRE',
  'TOLIMA',
  'VALLE',
  'VAUPES',
  'VICHADA',
]

export default function FiltrosExplorador({ filtrosActuales, onAplicarFiltros, onNuevoRegistro }) {
  const [search, setSearch] = useState(filtrosActuales.search || '')
  const [departamento, setDepartamento] = useState(filtrosActuales.departamento || '')
  const [naturaleza, setNaturaleza] = useState(filtrosActuales.naturaleza || '')
  const [zona, setZona] = useState(filtrosActuales.zona || '')
  const [puntajeMin, setPuntajeMin] = useState(filtrosActuales.puntaje_min || '')
  const [puntajeMax, setPuntajeMax] = useState(filtrosActuales.puntaje_max || '')

  // Dispara el envío de los filtros hacia el componente principal
  function manejarAplicar(evento) {
    if (evento) evento.preventDefault()
    onAplicarFiltros({
      search: search.trim(),
      departamento: departamento === 'TODOS' ? '' : departamento,
      naturaleza,
      zona,
      puntaje_min: puntajeMin,
      puntaje_max: puntajeMax,
    })
  }

  // Resetea todos los campos a su estado inicial vacío
  function manejarLimpiar() {
    setSearch('')
    setDepartamento('')
    setNaturaleza('')
    setZona('')
    setPuntajeMin('')
    setPuntajeMax('')
    onAplicarFiltros({})
  }

  return (
    <div className="filtros-card">
      <form onSubmit={manejarAplicar}>
        <div className="filtros-grid">
          {/* Buscador de texto libre en SQL */}
          <div className="campo-filtro" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="filtro-search">Búsqueda libre</label>
            <input
              id="filtro-search"
              type="text"
              placeholder="Nombre del colegio, municipio o consecutivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Selector de Departamento */}
          <div className="campo-filtro">
            <label htmlFor="filtro-depto">Departamento</label>
            <select
              id="filtro-depto"
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
            >
              <option value="">Todos los departamentos</option>
              {DEPARTAMENTOS_COMUNES.filter((d) => d !== 'TODOS').map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Naturaleza Jurídica */}
          <div className="campo-filtro">
            <label htmlFor="filtro-nat">Categoria</label>
            <select
              id="filtro-nat"
              value={naturaleza}
              onChange={(e) => setNaturaleza(e.target.value)}
            >
              <option value="">Todas las categorias</option>
              <option value="OFICIAL">OFICIAL (Público)</option>
              <option value="NO OFICIAL">NO OFICIAL (Privado)</option>
            </select>
          </div>

          {/* Selector de Zona Territorial */}
          <div className="campo-filtro">
            <label htmlFor="filtro-zona">Zona Geográfica</label>
            <select
              id="filtro-zona"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
            >
              <option value="">Todas las zonas</option>
              <option value="URBANA">URBANA</option>
              <option value="RURAL">RURAL</option>
            </select>
          </div>

          {/* Rango de Puntaje Global Mínimo */}
          <div className="campo-filtro">
            <label htmlFor="filtro-pmin">Puntaje Mínimo</label>
            <input
              id="filtro-pmin"
              type="number"
              min="0"
              max="500"
              placeholder="0"
              value={puntajeMin}
              onChange={(e) => setPuntajeMin(e.target.value)}
            />
          </div>

          {/* Rango de Puntaje Global Máximo */}
          <div className="campo-filtro">
            <label htmlFor="filtro-pmax">Puntaje Máximo</label>
            <input
              id="filtro-pmax"
              type="number"
              min="0"
              max="500"
              placeholder="500"
              value={puntajeMax}
              onChange={(e) => setPuntajeMax(e.target.value)}
            />
          </div>

          {/* Botones de acción del filtro y nuevo registro */}
          <div className="acciones-filtro" style={{ gridColumn: 'span 2' }}>
            <button type="submit" className="btn-accion primario">
              Filtrar en SQL
            </button>
            <button type="button" className="btn-accion limpiar" onClick={manejarLimpiar}>
              Limpiar
            </button>
            <button
              type="button"
              className="btn-accion primario"
              style={{ marginLeft: 'auto', background: 'var(--verde)' }}
              onClick={onNuevoRegistro}
            >
              + Nuevo Registro
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
