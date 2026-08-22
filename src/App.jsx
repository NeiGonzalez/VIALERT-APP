import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { useSpeech } from './hooks/useSpeech'
import MapView from './components/MapView'
import ReportFlow from './components/ReportFlow'
import LoginForm from './components/LoginForm'
import BomberosPanel from './components/BomberosPanel'
import MisReportes from './components/MisReportes'
import ConnectionStatus from './components/ConnectionStatus'
import logo from './assets/logo.png'

function Home() {
  const online = useOnlineStatus()
  const [user, setUser] = useLocalStorage('ViAlert-APP_user', null)
  const [reports, setReports] = useLocalStorage('ViAlert-APP_reports', [])
  const [showReport, setShowReport] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [notif, setNotif] = useState(null)
  const [connectionMode, setConnectionMode] = useState('auto')
  const pending = reports.filter(r => r.status === 'pending').length
  const navigate = useNavigate()

  const isOnline = connectionMode === 'starlink' || (connectionMode === 'auto' && online)
  const isOffline = connectionMode === 'offline' || (connectionMode === 'auto' && !online)

  const { speak } = useSpeech()

  useEffect(() => {
    if (isOnline) {
      const pendingNow = reports.filter(r => r.status === 'pending')
      if (pendingNow.length > 0) {
        setReports(prev => prev.map(r => r.status === 'pending' ? { ...r, status: 'sent', sentAt: Date.now() } : r))
        setNotif({
          text: `${pendingNow.length} reporte${pendingNow.length > 1 ? 's' : ''} enviado${pendingNow.length > 1 ? 's' : ''} automáticamente`,
          type: 'success'
        })
        speak(`${pendingNow.length} reporte enviado automáticamente`)
        setTimeout(() => setNotif(null), 8000)
      }
    }
  }, [isOnline])

  const handleConnectionMode = (mode) => setConnectionMode(mode)

  const handleReport = () => {
    if (!user || user.active === false) {
      speak('Para reportar una emergencia, primero registrá tus datos.')
      navigate('/login')
      return
    }
    setShowReport(true)
    speak('Modo reporte de emergencia activado. Seleccioná qué estás viendo.')
  }

  const clearAllData = () => {
    if (confirm('¿Estás segura de borrar TODOS los datos de la app? Esto eliminará tu cuenta, reportes y configuración.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {notif && (
        <div style={{
          position: 'fixed', top: '60px', left: '1rem', right: '1rem', zIndex: 100000,
          background: notif.type === 'success' ? 'var(--accent-success)' : 'var(--accent-warning)',
          color: notif.type === 'success' ? '#fff' : '#000',
          padding: '1rem', borderRadius: '12px', fontWeight: 700, textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
          {notif.text}
        </div>
      )}

      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src={logo} alt="ViAlert-APP" style={{ width: '32px', height: '32px', borderRadius: '8px' }} />
          <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>ViAlert-APP</span>
          <ConnectionStatus online={online} mode={connectionMode} onModeChange={handleConnectionMode} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn-secondary" style={{ minHeight: '40px', padding: '0.5rem 1rem' }}
            onClick={() => setShowMenu(!showMenu)}>
            ☰
          </button>
        </div>
      </div>

      {showMenu && (
        <div style={{
          position: 'fixed', top: '56px', right: '0.5rem', zIndex: 100001,
          background: 'var(--bg-secondary)', borderRadius: '12px',
          padding: '0.5rem', minWidth: '200px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <button className="btn-secondary" style={{ width: '100%', textAlign: 'left', marginBottom: '0.5rem' }}
            onClick={() => { setShowMenu(false); navigate('/login') }}>
            {user && user.active !== false ? '👤 ' + user.name : user ? '👤 Usuario registrado' : '👤 Ingresar'}
          </button>
          <button className="btn-secondary" style={{ width: '100%', textAlign: 'left', marginBottom: '0.5rem' }}
            onClick={() => { setShowMenu(false); navigate('/mis-reportes') }}>
            📋 Mis reportes ({reports.length})
          </button>
          {user?.role === 'bombero' && (
            <button className="btn-secondary" style={{ width: '100%', textAlign: 'left', marginBottom: '0.5rem' }}
              onClick={() => { setShowMenu(false); navigate('/panel') }}>
              🚨 Panel de emergencias
            </button>
          )}
          <hr style={{ border: 'none', borderTop: '1px solid var(--bg-card)', margin: '0.5rem 0' }} />
          <button className="btn-danger" style={{ width: '100%', textAlign: 'left', fontSize: '0.85rem' }}
            onClick={() => { setShowMenu(false); clearAllData() }}>
            🗑️ Borrar todos los datos
          </button>
        </div>
      )}

      <main className="home-content">
        <p className="home-tagline">Reportá incendios y accidentes aun con conectividad limitada.</p>
        {isOffline && (
          <div className="airplane-hint">Sin conexión. Si activaste modo avión, desactivalo para intentar enviar el reporte.</div>
        )}
        <button className="btn-primary emergency-button home-emergency-button" onClick={handleReport}>
          🚨 REPORTAR EMERGENCIA
        </button>
        <div className="map-frame">
          <span className="demo-badge">Datos demo</span>
          <MapView />
        </div>
      </main>

      {pending > 0 && (
        <div style={{
          position: 'fixed', top: '60px', left: '1rem', right: '1rem',
          background: 'var(--accent-warning)', color: '#000', padding: '0.75rem 1rem',
          borderRadius: '12px', fontWeight: 700, zIndex: 99999, textAlign: 'center'
        }}>
          {pending} reporte{pending > 1 ? 's' : ''} pendiente{pending > 1 ? 's' : ''} de envío
        </div>
      )}

      {showReport && (
        <ReportFlow onClose={() => setShowReport(false)} isOnline={isOnline} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/panel" element={<BomberosPanel />} />
      <Route path="/mis-reportes" element={<MisReportes />} />
    </Routes>
  )
}
