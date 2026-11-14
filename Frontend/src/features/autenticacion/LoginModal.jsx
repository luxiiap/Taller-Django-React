import { useState } from 'react'
import { loginUsuario } from '../../shared/api'

export default function LoginModal({ isOpen, onClose, onLoginExitoso }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  async function manejarSubmit(evento) {
    evento.preventDefault()
    setError(null)
    setCargando(true)

    try {
      const { token, usuario } = await loginUsuario(username.trim(), password)
      onLoginExitoso(usuario, token)
      setPassword('')
      onClose()
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Verifica usuario y contraseña.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Iniciar Sesión en el Observatorio</h3>
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

            <div className="campo-filtro" style={{ marginBottom: '14px' }}>
              <label htmlFor="input-username">Usuario de Django</label>
              <input
                id="input-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                required
                autoFocus
              />
            </div>

            <div className="campo-filtro" style={{ marginBottom: '14px' }}>
              <label htmlFor="input-password">Contraseña</label>
              <input
                id="input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-accion limpiar"
              onClick={onClose}
              disabled={cargando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-accion primario"
              disabled={cargando}
            >
              {cargando ? 'Verificando...' : 'Obtener Token'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}