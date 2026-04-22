import { useState, useEffect, useRef } from 'react'
import { Icon } from '../components/icons'
import Pressable from '../components/Pressable'
import webcamsData from '../data/webcams.json'

const TITLE = {
  nl: 'Texelse webcams',
  en: 'Texel webcams',
  de: 'Texel Webcams',
  fr: 'Webcams de Texel',
}

const SUB = {
  nl: 'Tik op een cam om de livestream te starten',
  en: 'Tap a cam to start the livestream',
  de: 'Tippen, um den Livestream zu starten',
  fr: 'Touchez une cam pour lancer le direct',
}

const OPEN = {
  nl: 'Livestream openen',
  en: 'Open livestream',
  de: 'Livestream öffnen',
  fr: 'Ouvrir le direct',
}

const LOADING = {
  nl: 'Stream laden…',
  en: 'Loading stream…',
  de: 'Stream lädt…',
  fr: 'Chargement…',
}

const OFFLINE = {
  nl: 'Livestream niet beschikbaar. Open in YouTube.',
  en: 'Livestream unavailable. Open in YouTube.',
  de: 'Livestream nicht verfügbar. In YouTube öffnen.',
  fr: "Flux indisponible. Ouvrir sur YouTube.",
}

const OPEN_EXT = {
  nl: 'Open in YouTube',
  en: 'Open in YouTube',
  de: 'In YouTube öffnen',
  fr: 'Ouvrir dans YouTube',
}

function CamDrawer({ cam, lang, open, onToggle }) {
  const [status, setStatus] = useState('idle') // idle | loading | loaded | offline
  const timerRef = useRef(null)
  const subtitle = cam.subtitle[lang] || cam.subtitle.nl

  useEffect(() => {
    if (!open) {
      setStatus('idle')
      clearTimeout(timerRef.current)
      return
    }
    setStatus('loading')
    timerRef.current = setTimeout(() => {
      setStatus(s => (s === 'loading' ? 'offline' : s))
    }, 9000)
    return () => clearTimeout(timerRef.current)
  }, [open, cam.id])

  const handleLoad = () => {
    clearTimeout(timerRef.current)
    setStatus('loaded')
  }

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 16,
      border: '1px solid var(--border2)',
      overflow: 'hidden',
    }}>
      <Pressable
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'transparent',
          textAlign: 'left',
        }}
      >
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: open ? '#000' : 'var(--chip)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'background 200ms ease',
        }}>
          {open
            ? <Icon.Camera size={18} color="#fff" />
            : <Icon.Play size={16} color="#000" />
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: -0.2,
            color: '#000',
          }}>{cam.name}</div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: 0.4,
            color: 'rgba(0,0,0,0.5)',
            marginTop: 2,
            textTransform: 'uppercase',
          }}>{subtitle}</div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: 999,
          border: '1px solid var(--border3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'transform 220ms ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <Icon.ChevronDown size={14} color="#000" />
        </div>
      </Pressable>

      {open && (
        <div style={{
          padding: '4px 14px 16px',
          borderTop: '1px solid var(--border2)',
        }}>
          <div style={{
            position: 'relative',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#000',
            aspectRatio: '16 / 9',
            marginTop: 10,
          }}>
            {status === 'offline' ? (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: 16, textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11, letterSpacing: 0.4,
                  color: 'rgba(255,255,255,0.7)',
                }}>{OFFLINE[lang] || OFFLINE.nl}</div>
                <Pressable
                  onClick={() => window.open(cam.url, '_blank', 'noopener')}
                  style={{
                    padding: '8px 14px', borderRadius: 20,
                    background: '#fff', color: '#000',
                    fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <Icon.Globe size={12} color="#000" />
                  {OPEN_EXT[lang] || OPEN_EXT.nl}
                </Pressable>
              </div>
            ) : (
              <>
                {status === 'loading' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11, letterSpacing: 0.6,
                    color: 'rgba(255,255,255,0.6)',
                    textTransform: 'uppercase',
                  }}>
                    {LOADING[lang] || LOADING.nl}
                  </div>
                )}
                <iframe
                  src={cam.embedUrl}
                  title={`Webcam ${cam.name}`}
                  onLoad={handleLoad}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    border: 0, display: 'block',
                    opacity: status === 'loaded' ? 1 : 0,
                    transition: 'opacity 300ms ease',
                  }}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                />
              </>
            )}
          </div>
          <div style={{
            marginTop: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
          }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, letterSpacing: 0.5,
              color: 'rgba(0,0,0,0.45)',
              textTransform: 'uppercase',
            }}>{cam.credit}</div>
            <Pressable
              onClick={() => window.open(cam.url, '_blank', 'noopener')}
              style={{
                padding: '6px 10px', borderRadius: 16,
                background: 'var(--chip)', color: '#000',
                fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600,
                border: '1px solid var(--border3)',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <Icon.Globe size={12} color="#000" />
              YouTube
            </Pressable>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Webcams({ onBack, lang }) {
  const [openId, setOpenId] = useState(null)

  const toggle = (id) => setOpenId(cur => (cur === id ? null : id))

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border2)' }}>
        <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Pressable
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--chip)', border: '1px solid var(--border3)', marginLeft: -4, flexShrink: 0,
            }}
          >
            <Icon.Back size={18} color="#000" />
          </Pressable>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 18, letterSpacing: -0.2 }}>
              {TITLE[lang] || TITLE.nl}
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, letterSpacing: 0.5,
              color: 'rgba(0,0,0,0.5)',
              textTransform: 'uppercase',
              marginTop: 2,
            }}>{SUB[lang] || SUB.nl}</div>
          </div>
        </div>
      </div>

      {/* Cam list */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '14px 16px 24px' }} className="scrollbar-none">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {webcamsData.cams.map(cam => (
            <CamDrawer
              key={cam.id}
              cam={cam}
              lang={lang}
              open={openId === cam.id}
              onToggle={() => toggle(cam.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
