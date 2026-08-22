import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { formatDate } from '../utils/helpers'

export default function MisReportes() {
  const navigate = useNavigate()
  const [reports] = useLocalStorage('ViAlert-APP_reports', [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="top-bar">
        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>📋 Mis reportes</span>
        <button className="btn-secondary" style={{ minHeight: '40px', padding: '0.5rem 1rem' }} onClick={() => navigate('/')}>
          Volver
        </button>
      </div>

      <div className="scroll-container" style={{ flex: 1 }}>
        {reports.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</p>
            <p style={{ color: 'var(--text-secondary)' }}>Todavía no hiciste ningún reporte.</p>
          </div>
        )}

        {reports.map(r => (
          <div key={r.id} className="card" style={{
            borderLeft: `4px solid ${r.type==='fire'?'var(--accent-fire)':'var(--accent-accident)'}`,
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem' }}>
                {r.type === 'fire' ? '🔥 Incendio' : '💥 Accidente'}
              </span>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '8px',
                background: r.status === 'sent' ? 'var(--accent-success)' : r.status === 'pending' ? 'var(--accent-warning)' : 'var(--bg-card)',
                color: r.status === 'sent' ? '#fff' : r.status === 'pending' ? '#000' : 'var(--text-primary)'
              }}>
                {r.status === 'sent' ? '✓ Enviado' : r.status === 'pending' ? '⏳ Pendiente' : '✓ Atendido'}
              </span>
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{r.description?.slice(0, 100) || 'Sin descripción'}...</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {formatDate(r.createdAt)}
            </p>
            {r.status === 'pending' && (
              <p style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', marginTop: '0.25rem' }}>
                📡 Se enviará automáticamente cuando tengas internet
              </p>
            )}
            {(r.confirmaciones?.length || 0) > 0 && (
              <p style={{ fontSize: '0.8rem', color: '#22c55e', marginTop: '0.25rem' }}>
                👁️ {r.confirmaciones.length} confirmación{r.confirmaciones.length > 1 ? 'es' : ''}
              </p>
            )}
            {r.photo && (
              <div style={{ marginTop: '0.75rem', borderRadius: '8px', overflow: 'hidden', maxWidth: '520px' }}>
                <img
                  src={r.photo}
                  alt="Evidencia"
                  style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }}
                />
              </div>
            )}
            {r.audio && (
              <div style={{ marginTop: '0.75rem' }}>
                <audio controls src={r.audio} style={{ width: '100%' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
