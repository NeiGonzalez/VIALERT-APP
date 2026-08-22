import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'

function MapResizer() {
  const map = useMap()
  const containerRef = useRef(null)

  useEffect(() => {
    // Forzar resize inmediato
    map.invalidateSize()

    // Usar ResizeObserver para detectar cambios de tamaño del contenedor
    const container = map.getContainer().parentElement
    if (!container) return

    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(container)

    // Múltiples intentos de resize
    const timers = [100, 300, 600, 1000].map(ms => 
      setTimeout(() => map.invalidateSize(), ms)
    )

    return () => {
      observer.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [map])

  return null
}

export default function ModalMap({ center, reporterPos, onPick }) {
  const [marker, setMarker] = useState(null)
  const mapRef = useRef(null)

  const handleClick = (e) => {
    const newPos = [e.latlng.lat, e.latlng.lng]
    setMarker(newPos)
    onPick(e.latlng.lat, e.latlng.lng)
  }

  return (
    <div style={{ height: '320px', width: '100%', position: 'relative', background: '#1a1a2e' }}>
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%', cursor: 'crosshair', background: '#1a1a2e' }}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        whenReady={(map) => {
          map.target.on('click', handleClick)
          // Forzar resize cuando esté listo
          setTimeout(() => map.target.invalidateSize(), 100)
          setTimeout(() => map.target.invalidateSize(), 300)
          setTimeout(() => map.target.invalidateSize(), 600)
        }}
      >
        <MapResizer />
        <TileLayer 
          attribution="&copy; OpenStreetMap" 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {reporterPos && (
          <Marker position={reporterPos}>
            <Popup>Vos acá</Popup>
          </Marker>
        )}
        {marker && <Marker position={marker} />}
      </MapContainer>
    </div>
  )
}
