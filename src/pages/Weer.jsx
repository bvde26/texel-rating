import { useState } from 'react'
import { Icon } from '../components/icons'
import Pressable from '../components/Pressable'

const SPOT_URL = 'https://21knots.nl/spot/texel-paal-17'

export default function Weer({ onBack, lang, t }) {
  const [loading, setLoading] = useState(true)

  const title = {
    nl: 'Weer op het rondje',
    en: 'Weather on the course',
    de: 'Wetter auf der Strecke',
    fr: 'Météo sur le parcours',
  }[lang] || 'Weer'

  const openExternal = {
    nl: 'Open op 21knots.nl',
    en: 'Open on 21knots.nl',
    de: 'Auf 21knots.nl öffnen',
    fr: 'Ouvrir sur 21knots.nl',
  }[lang] || 'Open'

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
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 18, letterSpacing: -0.2, flex: 1 }}>
            {title}
          </div>
          <Pressable
            onClick={() => window.open(SPOT_URL, '_blank', 'noopener')}
            style={{
              padding: '6px 12px', borderRadius: 20,
              background: 'var(--chip)', color: '#000',
              fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600,
              border: '1px solid var(--border3)',
              display: 'flex', alignItems: 'center', gap: 6,
              flexShrink: 0,
            }}
          >
            <Icon.Globe size={14} color="#000" />
            21knots
          </Pressable>
        </div>
      </div>

      {/* Iframe van 21knots paal 17 */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>
        {loading && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, letterSpacing: 0.6,
            color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase',
          }}>
            {lang === 'nl' ? 'Laden…' : 'Loading…'}
          </div>
        )}
        <iframe
          src={SPOT_URL}
          title="Wind & weer paal 17"
          onLoad={() => setLoading(false)}
          style={{
            width: '100%', height: '100%',
            border: 0,
            display: 'block',
          }}
        />
      </div>

      {/* Footer credit */}
      <div style={{
        flexShrink: 0,
        padding: '10px 20px 14px',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
        color: 'rgba(0,0,0,0.4)', letterSpacing: 0.4,
        textAlign: 'center',
        textTransform: 'uppercase',
      }}>
        {lang === 'nl' ? 'Data via' : 'Data from'} 21knots.nl · Paal 17
      </div>
    </div>
  )
}
