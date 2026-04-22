import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Polyline, Polygon, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import Pressable from './Pressable'
import { Icon } from './icons'

const TYPE_STYLE = {
  start:    { color: '#00B050', radius: 8 },
  vessel:   { color: '#FFC400', radius: 7 },
  landmark: { color: '#8B5CF6', radius: 6 },
  cardinal: { color: '#E4002B', radius: 6 },
  mark:     { color: '#E4002B', radius: 8 },
}

const L_I18N = {
  layer_seamark:    { nl: 'Betonning', en: 'Seamarks', de: 'Seezeichen', fr: 'Balisage' },
  layer_route:      { nl: 'Route & gates', en: 'Route & gates', de: 'Strecke & Gates', fr: 'Parcours & portes' },
  layer_restricted: { nl: 'Verboden', en: 'Restricted', de: 'Sperrgebiete', fr: 'Interdit' },
  fullscreen:       { nl: 'Volledig scherm', en: 'Fullscreen', de: 'Vollbild', fr: 'Plein écran' },
  close:            { nl: 'Sluiten', en: 'Close', de: 'Schließen', fr: 'Fermer' },
  offline:          { nl: 'Offline — waypoints', en: 'Offline — waypoints', de: 'Offline — Wegpunkte', fr: 'Hors ligne — points' },
}

const pick = (obj, lang) => obj?.[lang] || obj?.nl || ''

const LS_KEY = 'routemap_layers_v1'

function loadLayers() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_KEY))
    if (stored && typeof stored === 'object') {
      return { seamark: true, route: true, restricted: true, ...stored }
    }
  } catch {}
  return { seamark: true, route: true, restricted: true }
}

// Polyline getekend door Bram in geojson.io (user-provided LineString, [lon, lat] naar [lat, lon]).
const NOR_ROUTE = [
  [53.174572448790656, 4.81588173256938],
  [53.13977540935812, 4.779167840865853],
  [53.10850454340164, 4.74600899011449],
  [53.080423, 4.727489],
  [53.051235974723824, 4.703964751136681],
  [53.02666822869239, 4.6980419833900555],
  [53.00279955424136, 4.698634142933997],
  [52.99175137139986, 4.708700855174413],
  [52.982800, 4.720108],
  [52.989612686908515, 4.768508969080017],
  [52.995315610215044, 4.794563988999187],
  [53.004581254481764, 4.808775818045916],
  [53.01491366583082, 4.821211168462298],
  [53.02025704596812, 4.8295014020721965],
  [53.0309418211792, 4.847266188381383],
  [53.044116065798505, 4.869176091495632],
  [53.06155684352942, 4.885164399172908],
  [53.07116405181765, 4.900560547306185],
  [53.079701993611735, 4.912995897722453],
  [53.135000, 5.000000],
  [53.173263, 4.886761],
  [53.18379959048764, 4.866215288687101],
  [53.18785299457997, 4.858909692388551],
  [53.18833937660173, 4.852686409006566],
  [53.18801512253364, 4.8451102379319195],
  [53.189249, 4.839270],
  [53.174394235021, 4.816429020154629],
]

function orderedRouteLine() {
  return NOR_ROUTE
}

function ResizeOnMount({ trigger }) {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 120)
    return () => clearTimeout(t)
  }, [trigger, map])
  return null
}

function Chip({ active, onClick, children }) {
  return (
    <Pressable
      onClick={onClick}
      style={{
        padding: '6px 11px',
        borderRadius: 999,
        background: active ? '#000' : 'var(--chip)',
        color: active ? '#fff' : '#000',
        border: '1px solid ' + (active ? '#000' : 'var(--border3)'),
        fontFamily: 'Outfit, sans-serif',
        fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
        flexShrink: 0,
        opacity: active ? 1 : 0.65,
      }}
    >{children}</Pressable>
  )
}

function MapBody({ data, layers, fullscreen }) {
  const line = orderedRouteLine(data.waypoints)
  return (
    <MapContainer
      center={[53.07, 4.80]}
      zoom={fullscreen ? 11 : 10}
      scrollWheelZoom={fullscreen}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        attribution='&copy; OSM'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {layers.seamark && (
        <TileLayer
          attribution='Seamarks &copy; OpenSeaMap'
          url="https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
          opacity={1}
          minZoom={8}
        />
      )}
      {layers.restricted && data.restrictedAreas.map(area => (
        <Polygon
          key={area.id}
          positions={area.polygon}
          pathOptions={{ color: '#8B5CF6', fillColor: '#8B5CF6', fillOpacity: 0.2, weight: 1 }}
        >
          <Tooltip>{area.name}</Tooltip>
        </Polygon>
      ))}
      {layers.route && (
        <>
          <Polyline
            positions={line}
            pathOptions={{ color: '#E4002B', weight: 3, opacity: 0.85, dashArray: '6 6' }}
          />
          {data.waypoints.filter(w => w.type !== 'route-point').map(w => {
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
        </>
      )}
      <ResizeOnMount trigger={fullscreen} />
    </MapContainer>
  )
}

export default function RouteMap({ data, lang }) {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  const [fullscreen, setFullscreen] = useState(false)
  const [layers, setLayers] = useState(loadLayers)

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

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(layers)) } catch {}
  }, [layers])

  useEffect(() => {
    if (!fullscreen) return
    const onKey = e => { if (e.key === 'Escape') setFullscreen(false) }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [fullscreen])

  const toggle = k => setLayers(l => ({ ...l, [k]: !l[k] }))

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
        }}>{pick(L_I18N.offline, lang)}</div>
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

  const chipRow = (
    <div style={{
      display: 'flex', gap: 6, overflowX: 'auto',
    }} className="scrollbar-none">
      <Chip active={layers.seamark} onClick={() => toggle('seamark')}>
        {pick(L_I18N.layer_seamark, lang)}
      </Chip>
      <Chip active={layers.route} onClick={() => toggle('route')}>
        {pick(L_I18N.layer_route, lang)}
      </Chip>
      <Chip active={layers.restricted} onClick={() => toggle('restricted')}>
        {pick(L_I18N.layer_restricted, lang)}
      </Chip>
    </div>
  )

  if (fullscreen) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#fff',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid var(--border2)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          <Pressable
            onClick={() => setFullscreen(false)}
            style={{
              width: 36, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--chip)', border: '1px solid var(--border3)',
              flexShrink: 0,
            }}
            aria-label={pick(L_I18N.close, lang)}
          >
            <Icon.Close size={18} color="#000" />
          </Pressable>
          <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
            {chipRow}
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <MapBody data={data} layers={layers} fullscreen />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {chipRow}
      <div style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border3)',
        height: 340,
      }}>
        <MapBody data={data} layers={layers} fullscreen={false} />
        <Pressable
          onClick={() => setFullscreen(true)}
          style={{
            position: 'absolute', top: 8, right: 8, zIndex: 500,
            padding: '7px 10px', borderRadius: 8,
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid var(--border3)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
            display: 'flex', alignItems: 'center', gap: 5,
            color: '#000',
          }}
          aria-label={pick(L_I18N.fullscreen, lang)}
        >
          <span style={{ fontSize: 13, lineHeight: 1 }}>⤢</span>
        </Pressable>
      </div>
    </div>
  )
}
