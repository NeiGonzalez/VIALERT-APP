import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { formatDate } from '../utils/helpers'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

// Reportes de ejemplo simulando que llegaron de otros usuarios
const REPORTES_EJEMPLO = [
  {
    id: 'demo-1',
    type: 'fire',
    createdAt: Date.now() - 1000 * 60 * 30, // 30 min atrás
    status: 'sent',
    reporterName: 'Carlos Martínez',
    reporterPhone: '2945-112233',
    reporterLat: -42.72,
    reporterLng: -71.55,
    incidentLat: -42.73,
    incidentLng: -71.56,
    description: 'Incendio visible desde la ruta 259. Mucho humo negro subiendo del cerro. Parece crecer rápido.',
    answers: { genteCerca: true, viviendasRiesgo: false, humoVisible: true },
    photo: null,
    audio: null,
    priority: 'ALTA',
    aiReason: 'Humo negro denso, personas cerca, fuego activo',
    viewed: false
  },
  {
    id: 'demo-2',
    type: 'accident',
    createdAt: Date.now() - 1000 * 60 * 120, // 2 horas atrás
    status: 'sent',
    reporterName: 'Ana López',
    reporterPhone: '2945-445566',
    reporterLat: -42.68,
    reporterLng: -71.30,
    incidentLat: -42.68,
    incidentLng: -71.30,
    description: 'Camioneta volcada en la ruta 40 km 85. Hay una persona adentro, no se mueve. Necesitamos ayuda urgente.',
    answers: { heridos: true, ambulancia: true, vehiculoCalzada: true },
    photo: null,
    audio: null,
    priority: 'ALTA',
    aiReason: 'Heridos confirmados, ambulancia requerida, vehículo en calzada',
    viewed: false
  },
  {
    id: 'demo-3',
    type: 'fire',
    createdAt: Date.now() - 1000 * 60 * 60 * 5, // 5 horas atrás
    status: 'attended',
    reporterName: 'Jorge Pérez',
    reporterPhone: '2945-778899',
    reporterLat: -42.82,
    reporterLng: -71.58,
    incidentLat: -42.83,
    incidentLng: -71.59,
    description: 'Fuego chico cerca del camping. Lo veo desde la costa del lago.',
    answers: { genteCerca: false, viviendasRiesgo: false, humoVisible: true },
    photo: null,
    audio: null,
    priority: 'NORMAL',
    aiReason: 'Fuego lejano, sin personas en riesgo',
    viewed: true
  }
]

const fireIcon = new L.DivIcon({
  className: 'custom-fire-icon',
  html: `<div style="background:#ef4444;width:14px;height:14px;border-radius:50%;border:2px solid #fff;"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7]
})
const accIcon = new L.DivIcon({
  className: 'custom-acc-icon',
  html: `<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:2px solid #fff;"></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7]
})

export default function BomberosPanel() {
  const navigate = useNavigate()
  const [user] = useLocalStorage('ViAlert-APP_user', null)
  const [localReports, setLocalReports] = useLocalStorage('ViAlert-APP_reports', [])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')

  if (!user || user.role !== 'bombero') {
    return (
      <div className="scroll-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <h2>Acceso restringido</h2>
        <p style={{ color: 'var(--text-secondary)', margin: '1rem 0' }}>Solo personal autorizado.</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>Ir a login</button>
      </div>
    )
  }

  // Combinar reportes locales + reportes de ejemplo (simulando recepción)
  const allReports = [...REPORTES_EJEMPLO, ...localReports]

  const filtered = allReports
    .filter(r => filter === 'all' || r.type === filter)
    .sort((a, b) => {
      // Ordenar por prioridad primero, luego por fecha
      const priorityOrder = { 'ALTA': 0, 'MEDIA': 1, 'NORMAL': 2 }
      const pDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
      if (pDiff !== 0) return pDiff
      return b.createdAt - a.createdAt
    })

  const markAttended = (id) => {
    setLocalReports(prev => prev.map(r => r.id === id ? { ...r, status: 'attended' } : r))
    // También marcar en los de ejemplo (solo visual en esta sesión)
    REPORTES_EJEMPLO.forEach(r => { if (r.id === id) r.status = 'attended' })
    setSelected(null)
  }

  const unviewed = filtered.filter(r => !r.viewed)
  const altaCount = filtered.filter(r => r.priority === 'ALTA' && r.status !== 'attended').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="top-bar">
        <div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>🚨 Panel de Emergencias</span>
          {altaCount > 0 && (
            <span style={{
              marginLeft: '0.5rem', background: 'var(--accent-danger)', color: '#fff',
              padding: '0.15rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700
            }}>
              {altaCount} URGENTE{altaCount > 1 ? 'S' : ''}
            </span>
          )}
        </div>
        <button className="btn-secondary" style={{ minHeight: '40px', padding: '0.5rem 1rem' }} onClick={() => navigate('/')}>
          Mapa
        </button>
      </div>

      {unviewed.length > 0 && (
        <div className="alarm" style={{
          padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 700,
          color: 'var(--accent-danger)', borderBottom: '1px solid var(--bg-secondary)'
        }}>
          🚨 {unviewed.length} NUEVO{unviewed.length > 1 ? 'S' : ''} REPORTE{unviewed.length > 1 ? 'S' : ''} SIN VER
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem', borderBottom: '1px solid var(--bg-secondary)' }}>
        {['all','fire','accident'].map(f => (
          <button key={f} className={filter === f ? 'btn-primary' : 'btn-secondary'}
            style={{ flex: 1, minHeight: '44px', fontSize: '0.9rem' }}
            onClick={() => setFilter(f)}>
            {f === 'all' ? 'Todos' : f === 'fire' ? '🔥 Incendios' : '💥 Accidentes'}
          </button>
        ))}
      </div>

      <div className="scroll-container" style={{ flex: 1 }}>
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
            No hay reportes.
          </p>
        )}

        {filtered.map(r => (
          <div key={r.id}
            className={!r.viewed ? 'alarm card' : 'card'}
            style={{ cursor: 'pointer', borderLeft: `4px solid ${r.type==='fire'?'var(--accent-fire)':'var(--accent-accident)'}` }}
            onClick={() => {
              setSelected(r)
              if (!r.viewed) {
                r.viewed = true
                setLocalReports(prev => [...prev]) // forzar re-render
              }
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.875rem' }}>
                {r.type === 'fire' ? '🔥 INCENDIO' : '💥 ACCIDENTE'}
              </span>
              <span style={{
                fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem', borderRadius: '8px',
                background: r.priority==='ALTA'?'var(--accent-danger)':r.priority==='MEDIA'?'var(--accent-warning)':'var(--bg-card)',
                color: r.priority==='ALTA'?'#fff':r.priority==='MEDIA'?'#000':'var(--text-primary)'
              }}>
                {r.priority}
              </span>
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{r.description?.slice(0, 80)}...</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {formatDate(r.createdAt)} · {r.reporterName}
            </p>
            {r.status === 'attended' && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 600 }}>✓ Atendido</span>
            )}
            {!r.viewed && (
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-danger)', fontWeight: 700 }}>● NUEVO</span>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ textTransform: 'uppercase' }}>
                {selected.type === 'fire' ? '🔥 Incendio' : '💥 Accidente'}
              </h2>
              <button className="btn-secondary" style={{ minHeight: '40px', width: '40px', padding: 0 }} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <span style={{
                display: 'inline-block', padding: '0.35rem 0.75rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem',
                background: selected.priority==='ALTA'?'var(--accent-danger)':selected.priority==='MEDIA'?'var(--accent-warning)':'var(--bg-card)',
                color: selected.priority==='ALTA'?'#fff':selected.priority==='MEDIA'?'#000':'var(--text-primary)'
              }}>
                Prioridad: {selected.priority}
              </span>
            </div>

            {selected.aiReason && (
              <div className="card" style={{ background: 'var(--bg-primary)', border: '1px solid var(--bg-card)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <b>Análisis IA:</b> {selected.aiReason}
                </p>
              </div>
            )}

            <div className="card">
              <p><b>Reportante:</b> {selected.reporterName} ({selected.reporterPhone})</p>
              <p style={{ marginTop: '0.5rem' }}><b>Fecha:</b> {formatDate(selected.createdAt)}</p>
              <p style={{ marginTop: '0.5rem' }}><b>Descripción:</b> {selected.description || 'Sin descripción'}</p>
            </div>

            {selected.answers && Object.keys(selected.answers).length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Detalles</h3>
                {Object.entries(selected.answers).map(([k,v]) => (
                  <p key={k} style={{ fontSize: '0.9rem', marginBottom: '0.35rem' }}>
                    {k}: <b>{v ? 'Sí' : 'No'}</b>
                  </p>
                ))}
              </div>
            )}

            {(selected.confirmaciones?.length || 0) > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Confirmaciones vecinales</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  {selected.confirmaciones.length} persona{selected.confirmaciones.length > 1 ? 's' : ''} confirm{selected.confirmaciones.length > 1 ? 'aron' : 'ó'} ver este siniestro
                </p>
                {selected.confirmaciones.slice(0, 3).map((c, i) => (
                  <p key={i} style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    👁️ {c.name} · {formatDate(c.timestamp)}
                  </p>
                ))}
                {selected.confirmaciones.length > 3 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    y {selected.confirmaciones.length - 3} más...
                  </p>
                )}
              </div>
            )}

            <div className="card">
              <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Ubicaciones</h3>
              <p style={{ fontSize: '0.9rem' }}><b>Incidente:</b> {selected.incidentLat?.toFixed(4)}, {selected.incidentLng?.toFixed(4)}</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.35rem' }}><b>Reportante:</b> {selected.reporterLat?.toFixed(4)}, {selected.reporterLng?.toFixed(4)}</p>
            </div>

            {selected.photo && (
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <img src={selected.photo} alt="Evidencia" style={{ width: '100%', display: 'block' }} />
              </div>
            )}

            {selected.audio && (
              <div className="card">
                <p style={{ marginBottom: '0.5rem', fontWeight: 600 }}>Audio del reporte:</p>
                <audio controls src={selected.audio} style={{ width: '100%' }} />
              </div>
            )}

            <div style={{ height: '250px', borderRadius: 'var(--border-radius)', overflow: 'hidden', marginBottom: '1rem' }}>
              <MapContainer center={[selected.incidentLat || selected.reporterLat, selected.incidentLng || selected.reporterLng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution="&copy; OSM" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[selected.incidentLat || selected.reporterLat, selected.incidentLng || selected.reporterLng]} icon={selected.type==='fire'?fireIcon:accIcon}>
                  <Popup>Incidente</Popup>
                </Marker>
                <Marker position={[selected.reporterLat, selected.reporterLng]}>
                  <Popup>Reportante</Popup>
                </Marker>
              </MapContainer>
            </div>

            {selected.status !== 'attended' && (
              <button className="btn-primary" onClick={() => markAttended(selected.id)}>
                Marcar como atendido
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
