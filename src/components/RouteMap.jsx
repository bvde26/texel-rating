import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Polygon, CircleMarker, Marker, Tooltip, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const TYPE_STYLE = {
  start:    { color: '#00B050', radius: 8, label: 'S/F' },
  gate:     { color: '#000',    radius: 7, label: 'G' },
  vessel:   { color: '#FFC400', radius: 7, label: 'VC' },
  landmark: { color: '#8B5CF6', radius: 6, label: 'L' },
  cardinal: { color: '#E4002B', radius: 6, label: 'C' },
  mark:     { color: '#E4002B', radius: 6, label: 'M' },
}

function orderedRouteLine(waypoints) {
  const order = ['start-finish', 'gate-1', 'lighthouse', 'gate-2', 'vc-vessel', 'ijzeren-kaap', 'gate-3', 't2', 'gate-4', 'wnb-5', 'wnb-3', 'wnb-1', 'start-finish']
  return order
    .map(id => waypoints.find(w => w.id === id))
    .filter(Boolean)
    .map(w => [w.lat, w.lon])
}

export default function RouteMap({ data, lang }) {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  if (!online) {
    return (
      <div style={{
        background: 'var(--chip)',
        border: '1px solid var(--border3)',
        borderRadius: 12,
        padding: '14px 14px 10px',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.5)',
          marginBottom: 10,
        }}>
          {lang === 'nl' ? 'Offline — waypoints' : 'Offline — waypoints'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {data.waypoints.map(w => (
            <div key={w.id} style={{
              display: 'flex', justifyContent: 'space-between', gap: 10,
              fontFamily: 'Outfit, sans-serif', fontSize: 13,
            }}>
              <span style={{ color: '#000' }}>{w.name}</span>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11, color: 'rgba(0,0,0,0.55)',
                fontVariantNumeric: 'tabular-nums',
              }}>{w.lat.toFixed(3)}, {w.lon.toFixed(3)}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const line = orderedRouteLine(data.waypoints)

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid var(--border3)',
      height: 340,
      position: 'relative',
    }}>
      <MapContainer
        center={[53.07, 4.80]}
        zoom={10}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://openstreetmap.org">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.restrictedAreas.map(area => (
          <Polygon
            key={area.id}
            positions={area.polygon}
            pathOptions={{ color: '#8B5CF6', fillColor: '#8B5CF6', fillOpacity: 0.2, weight: 1 }}
          >
            <Tooltip>{area.name}</Tooltip>
          </Polygon>
        ))}
        <Polyline
          positions={line}
          pathOptions={{ color: '#E4002B', weight: 3, opacity: 0.85, dashArray: '6 6' }}
        />
        {data.waypoints.map(w => {
          const s = TYPE_STYLE[w.type] || TYPE_STYLE.mark
          return (
            <CircleMarker
              key={w.id}
              center={[w.lat, w.lon]}
              radius={s.radius}
              pathOptions={{ color: '#000', weight: 1, fillColor: s.color, fillOpacity: 1 }}
            >
              <Tooltip>{w.name}</Tooltip>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
