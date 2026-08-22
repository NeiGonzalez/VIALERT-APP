import { useState } from 'react'
import { useOnlineStatus } from '../hooks/useOnlineStatus'

export default function StarlinkSim() {
  const online = useOnlineStatus()
  const [connected, setConnected] = useState(false)

  if (online) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div className="visual-banner info" style={{ padding: '0.5rem', fontSize: '0.9rem' }}>
        📡 Sin señal celular detectada
      </div>
      <button
        className={connected ? 'btn-secondary' : 'btn-starlink'}
        style={{ minHeight: '48px', fontSize: '0.95rem' }}
        onClick={() => setConnected(!connected)}
      >
        {connected ? '✓ Conectado vía Starlink (simulado)' : '📡 Simular conexión Starlink'}
      </button>
      {connected && (
        <div className="visual-banner success" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>
          ✅ Reportes se enviarían vía satélite (simulación para futura integración)
        </div>
      )}
    </div>
  )
}
