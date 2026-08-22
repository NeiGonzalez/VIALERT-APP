import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function LoginForm() {
  const [user, setUser] = useLocalStorage('ViAlert-APP_user', null)
  const [mode, setMode] = useState('user')
  const [form, setForm] = useState({ name: '', lastname: '', phone: '', code: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const goHome = () => navigate('/')
  const isActive = !!user && user.active !== false

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    let role = 'user'
    if (mode === 'bombero') {
      const code = form.code.trim().toUpperCase()
      if (code !== 'BOMBERO2026' && code !== 'POLICIA2026') {
        setError('Código incorrecto. Usá: BOMBERO2026 o POLICIA2026')
        return
      }
      role = 'bombero'
    }
    setUser({
      name: `${form.name.trim()} ${form.lastname.trim()}`.trim(),
      phone: form.phone.trim(),
      role,
      joinedAt: Date.now(),
      active: true
    })
    goHome()
  }

  const logout = () => {
    if (user) setUser({ ...user, active: false })
    goHome()
  }

  const loginSavedUser = () => {
    if (user) setUser({ ...user, active: true })
    goHome()
  }

  const useAnotherUser = () => {
    setUser(null)
    setMode('user')
    setForm({ name: '', lastname: '', phone: '', code: '' })
  }

  const deleteSavedUser = () => {
    const confirmed = window.confirm('¿Eliminar el usuario guardado en este dispositivo?')
    if (!confirmed) return
    setUser(null)
    setMode('user')
    setForm({ name: '', lastname: '', phone: '', code: '' })
    setError('')
  }

  if (user) {
    return (
      <div className="login-page">
        <div className="login-shell">
          <h1>ViAlert-APP</h1>
          <div className="card account-card">
            <div className="account-state">{isActive ? 'Usuario activo' : 'Usuario registrado'}</div>
            <strong>{user.name}</strong>
            <span>{user.phone}</span>
            <span>{user.role === 'bombero' ? 'Bombero / Policía' : 'Usuario'}</span>

            {isActive ? (
              <button className="btn-danger compact-action" onClick={logout}>Cerrar sesión</button>
            ) : (
              <>
                <button className="btn-primary compact-action" onClick={loginSavedUser}>Ingresar</button>
                <button className="btn-secondary compact-action" onClick={useAnotherUser}>Usar otro usuario</button>
                <button
                  className="compact-action"
                  onClick={deleteSavedUser}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Eliminar usuario
                </button>
              </>
            )}
          </div>
          <button className="btn-secondary compact-action" onClick={goHome}>Volver al mapa</button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-shell">
        <h1>ViAlert-APP</h1>
        <div className="login-modes">
          <button className={mode === 'user' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setMode('user'); setError('') }}>
            Soy vecino
          </button>
          <button className={mode === 'bombero' ? 'btn-primary' : 'btn-secondary'} onClick={() => { setMode('bombero'); setError('') }}>
            Soy bombero / policía
            {mode === 'bombero' && <span className="demo-access">Acceso demo</span>}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card login-form-card">
          <label>Nombre</label>
          <input required autoComplete="given-name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          <label>Apellido</label>
          <input required autoComplete="family-name" value={form.lastname} onChange={e => setForm({...form, lastname: e.target.value})} />
          <label>Número de celular</label>
          <input required type="tel" autoComplete="tel" placeholder="2945..." value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />

          {mode === 'bombero' && (
            <>
              <label>Código de acceso <span className="demo-inline">Demo: BOMBERO2026 / POLICIA2026</span></label>
              <input required type="text" placeholder="BOMBERO2026" value={form.code} onChange={e => setForm({...form, code: e.target.value})} />
            </>
          )}

          {error && <div className="login-error">⚠️ {error}</div>}
          <button type="submit" className="btn-primary compact-action">{mode === 'user' ? 'Registrarme' : 'Ingresar al panel'}</button>
        </form>
        <button className="btn-secondary compact-action" onClick={goHome}>Volver sin registrarme</button>
      </div>
    </div>
  )
}
