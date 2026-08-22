import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { INCENDIOS_EJEMPLO, ACCIDENTES_EJEMPLO, AREA_QUEMADA_EJEMPLO, ZONA_INICIAL } from '../data/sampleData'
import { useOnlineStatus } from '../hooks/useOnlineStatus'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { isExpired } from '../utils/aiAnalyzer'
import { formatDate } from '../utils/helpers'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const fireIcon = new L.DivIcon({
  className: 'custom-fire-icon',
  html: `<div style="background:#ef4444;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px #ef4444;"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
})

export default function MapView() {
  const online = useOnlineStatus()
  const [user] = useLocalStorage('ViAlert-APP_user', null)
  const [reports, setReports] = useLocalStorage('ViAlert-APP_reports', [])
  const [userPos, setUserPos] = useState(null)
  const [showAll, setShowAll] = useState(false)

  // GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => setUserPos([p.coords.latitude, p.coords.longitude]),
        () => setUserPos([ZONA_INICIAL.lat, ZONA_INICIAL.lng]),
        { timeout: 8000, enableHighAccuracy: false }
      )
    } else {
      setUserPos([ZONA_INICIAL.lat, ZONA_INICIAL.lng])
    }
  }, [])

  // Confirmar un siniestro
  const confirmar = useCallback((reportId, isDemo) => {
    if (isDemo) {
      // Confirmar reporte de ejemplo (solo visual)
      alert('Confirmación registrada. En producción, esto sumaría una confirmación real.')
      return
    }
    setReports(prev => prev.map(r => {
      if (r.id === reportId) {
        const confs = r.confirmaciones || []
        const yaConfirmo = confs.some(c => c.phone === user?.phone)
        if (yaConfirmo) return r
        return {
          ...r,
          confirmaciones: [...confs, {
            name: user?.name || 'Anónimo',
            phone: user?.phone || 'desconocido',
            timestamp: Date.now()
          }]
        }
      }
      return r
    }))
  }, [user, setReports])

  // Filtrar reportes expirados del mapa (pero no del panel)
  const activeReports = reports.filter(r => !isExpired(r) && r.status !== 'attended')

  if (!userPos) {
    return (
      <div className="map-container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '1rem'
      }}>
        <div className="spinner" />
        <p>Cargando mapa...</p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <MapContainer
        center={userPos}
        zoom={ZONA_INICIAL.zoom}
        className="map-container"
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
      >
        {online ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        ) : (
          <TileLayer attribution='Sin conexión a internet' url="" />
        )}

        {/* Ubicación del usuario */}
        <Marker position={userPos}>
          <Popup>Tu ubicación</Popup>
        </Marker>

        {/* Focos de incendio (ejemplos) */}
        {INCENDIOS_EJEMPLO.map(inc => (
          <Marker key={inc.id} position={[inc.lat, inc.lng]} icon={fireIcon}>
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <b style={{ color: '#ef4444' }}>{inc.titulo}</b><br/>
                <span style={{ fontSize: '0.85rem' }}>Intensidad: {inc.intensidad}</span><br/>
                <span style={{ fontSize: '0.85rem' }}>Fecha: {inc.fecha}</span><br/>
                {inc.confirmaciones > 0 && (
                  <span style={{ fontSize: '0.85rem', color: '#22c55e' }}>
                    ✅ {inc.confirmaciones} vecino{inc.confirmaciones > 1 ? 's' : ''} lo confirm{inc.confirmaciones > 1 ? 'an' : 'ó'}
                  </span>
                )}
                <button
                  style={{
                    marginTop: '0.5rem', width: '100%', padding: '0.5rem',
                    background: '#22c55e', color: '#fff', border: 'none',
                    borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                  }}
                  onClick={() => confirmar(inc.id, true)}
                >
                  👁️ Yo también lo veo
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Accidentes (ejemplos) */}
        {ACCIDENTES_EJEMPLO.map(acc => (
          <CircleMarker
            key={acc.id}
            center={[acc.lat, acc.lng]}
            radius={12}
            pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.5, weight: 2 }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <b style={{ color: '#3b82f6' }}>{acc.titulo}</b><br/>
                <span style={{ fontSize: '0.85rem' }}>{acc.descripcion}</span><br/>
                <span style={{ fontSize: '0.85rem' }}>Fecha: {acc.fecha}</span><br/>
                {acc.confirmaciones > 0 && (
                  <span style={{ fontSize: '0.85rem', color: '#22c55e' }}>
                    ✅ {acc.confirmaciones} vecino{acc.confirmaciones > 1 ? 's' : ''} lo confirm{acc.confirmaciones > 1 ? 'an' : 'ó'}
                  </span>
                )}
                <button
                  style={{
                    marginTop: '0.5rem', width: '100%', padding: '0.5rem',
                    background: '#22c55e', color: '#fff', border: 'none',
                    borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                  }}
                  onClick={() => confirmar(acc.id, true)}
                >
                  👁️ Yo también lo veo
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Reportes de usuarios activos en el mapa */}
        {activeReports.filter(r => r.status !== 'pending').map(r => (
          <Marker key={r.id} position={[r.incidentLat || r.reporterLat, r.incidentLng || r.reporterLng]} icon={r.type === 'fire' ? fireIcon : new L.DivIcon({
            className: 'custom-acc-icon',
            html: `<div style="background:#3b82f6;width:18px;height:18px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px #3b82f6;"></div>`,
            iconSize: [18, 18], iconAnchor: [9, 9]
          })}>
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <b style={{ color: r.type === 'fire' ? '#ef4444' : '#3b82f6' }}>
                  {r.type === 'fire' ? '🔥 Incendio reportado' : '💥 Accidente reportado'}
                </b><br/>
                <span style={{ fontSize: '0.85rem' }}>{r.description?.slice(0, 60)}...</span><br/>
                <span style={{ fontSize: '0.85rem' }}>{formatDate(r.createdAt)}</span><br/>
                {(r.confirmaciones?.length || 0) > 0 && (
                  <span style={{ fontSize: '0.85rem', color: '#22c55e' }}>
                    ✅ {r.confirmaciones.length} confirmación{r.confirmaciones.length > 1 ? 'es' : ''}
                  </span>
                )}
                <button
                  style={{
                    marginTop: '0.5rem', width: '100%', padding: '0.5rem',
                    background: '#22c55e', color: '#fff', border: 'none',
                    borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                  }}
                  onClick={() => confirmar(r.id, false)}
                >
                  👁️ Yo también lo veo
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Área quemada */}
        <Polygon
          positions={AREA_QUEMADA_EJEMPLO.map(p => [p.lat, p.lng])}
          pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.4 }}
        >
          <Popup>Área quemada estimada - Puerto Café 2024</Popup>
        </Polygon>
      </MapContainer>

      {/* Botón flotante para ver todos los siniestros */}
      <button
        className="active-incidents-toggle"
        onClick={() => setShowAll(!showAll)}
      >
        {showAll ? 'Ocultar' : '📍 Siniestros'}
      </button>

      {/* Lista flotante de siniestros */}
      {showAll && (
        <div style={{
          position: 'absolute', top: '110px', right: '10px', zIndex: 500,
          background: 'var(--bg-secondary)', borderRadius: '12px',
          padding: '0.75rem', minWidth: '220px', maxHeight: '300px', overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)', border: '1px solid var(--bg-card)'
        }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Siniestros activos
          </p>
          {[...INCENDIOS_EJEMPLO, ...ACCIDENTES_EJEMPLO, ...activeReports].map(item => (
            <div key={item.id} style={{
              padding: '0.5rem', marginBottom: '0.35rem', borderRadius: '8px',
              background: item.tipo === 'foco' || item.type === 'fire' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
              fontSize: '0.8rem'
            }}>
              <span style={{ fontWeight: 600 }}>
                {item.tipo === 'foco' || item.type === 'fire' ? '🔥' : '💥'} {item.titulo || item.description?.slice(0, 20)}
              </span>
              <br/>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                {item.confirmaciones?.length || item.confirmaciones || 0} confirmaciones
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
