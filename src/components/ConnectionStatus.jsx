import { useState } from 'react'

export default function ConnectionStatus({ online, mode = 'auto', onModeChange }) {
  const [showMenu, setShowMenu] = useState(false)
  const status = mode === 'starlink' ? 'starlink' : mode === 'offline' ? 'offline' : online ? 'online' : 'offline'
  const config = {
    online: { text: '📶 Internet', color: 'var(--accent-success)', bg: 'rgba(34,197,94,0.15)' },
    offline: { text: '📡 Sin conexión', color: 'var(--accent-danger)', bg: 'rgba(239,68,68,0.15)' },
    starlink: { text: '🛰️ Starlink', color: '#a78bfa', bg: 'rgba(139,92,246,0.15)' }
  }
  const c = config[status]
  const choose = (next) => { onModeChange(next); setShowMenu(false) }

  return <div className="connection-wrap">
    <button className="connection-pill" onClick={() => setShowMenu(!showMenu)} style={{background:c.bg,color:c.color}}>{c.text}</button>
    {showMenu && <div className="connection-menu">
      <p className="connection-title">Conectividad · simulación MVP</p>
      <button className="btn-secondary" onClick={() => choose('auto')}>📶 Internet / detección normal</button>
      <button className="btn-secondary" onClick={() => choose('starlink')}>🛰️ Simular Starlink Direct to Cell</button>
      <button className="btn-secondary" onClick={() => choose('offline')}>📡 Simular sin conexión</button>
      <small>Starlink es una simulación de escalabilidad futura.</small>
    </div>}
  </div>
}
