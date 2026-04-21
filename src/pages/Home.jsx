import { Icon } from '../components/icons'
import Pressable from '../components/Pressable'

import registrationsData from '../data/registrations.json'

const EVENT_DATE = new Date('2026-05-25')
const EVENT_EDITIE = 51
const LANGS = ['nl', 'en', 'de', 'fr']
const FLAGS = { nl: '🇳🇱', en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷' }

function daysUntil(date) {
  const now = new Date()
  const diff = date - new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function HomeTile({ variant, eyebrow, title, sub, meta, onClick }) {
  const dark = variant === 'dark'
  return (
    <Pressable
      onClick={onClick}
      style={{
        background: dark ? '#000' : '#fff',
        color: dark ? '#fff' : '#000',
        borderRadius: 20,
        padding: '22px 22px 20px',
        minHeight: 148,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: dark
          ? '0 10px 30px -12px rgba(0,0,0,0.4)'
          : '0 2px 8px -4px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        }}>{eyebrow}</div>
        <div style={{
          width: 36, height: 36, borderRadius: 999,
          background: 'transparent',
          border: dark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon.ArrowRight size={16} color={dark ? '#fff' : '#000'}/>
        </div>
      </div>
      <div>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: -0.9,
          lineHeight: 1,
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>{title}</div>
        <div style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          color: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.55)',
          letterSpacing: -0.1,
        }}>{sub}</div>
      </div>
      {meta && (
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
          letterSpacing: 0.4,
          marginTop: 8,
        }}>{meta}</div>
      )}
    </Pressable>
  )
}

const CAT_LABELS = {
  catamaran_duo: { nl: 'Catamaran duo', en: 'Catamaran duo', de: 'Katamaran Duo', fr: 'Catamaran duo' },
  wingfoil: { nl: 'Wingfoil', en: 'Wingfoil', de: 'Wingfoil', fr: 'Wingfoil' },
  windsurf: { nl: 'Windsurf', en: 'Windsurf', de: 'Windsurf', fr: 'Windsurf' },
  catamaran_single: { nl: 'Catamaran solo', en: 'Catamaran single', de: 'Katamaran Solo', fr: 'Catamaran solo' },
}

function RegistrationsTile({ t, categories, onClick }) {
  const total = Object.values(categories).reduce((s, c) => s + c.count, 0)
  return (
    <Pressable
      onClick={onClick}
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '20px 20px 18px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 8px -4px rgba(0,0,0,0.08)',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
        textAlign: 'left',
      }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', gap: 12, marginBottom: 14, minWidth: 0,
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11, letterSpacing: 0.6,
          textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.5)',
          flex: 1, minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>03 / {t.tile_reg_eyebrow}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700, fontSize: 20,
            letterSpacing: -0.6, color: '#000',
          }}>{total}</div>
          <div style={{
            width: 30, height: 30, borderRadius: 999,
            border: '1px solid rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Icon.ArrowRight size={14} color="#000" />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
        {Object.entries(categories).map(([id, cat]) => (
          <div key={id} style={{
            display: 'flex', alignItems: 'baseline', gap: 10,
            minWidth: 0, width: '100%',
          }}>
            <div style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 13, color: 'rgba(0,0,0,0.65)',
              flex: '1 1 auto', minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{t[`cat_${id}`] || cat.nameNl}</div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13, fontWeight: 600,
              color: '#000',
              flex: '0 0 auto',
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
            }}>{cat.count}</div>
          </div>
        ))}
      </div>
    </Pressable>
  )
}

export default function Home({ t, lang, setLang, go }) {
  const days = daysUntil(EVENT_DATE)
  const now = new Date()
  const dateStr = now.toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* Brand header */}
      <div style={{ padding: '22px 20px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, letterSpacing: 0.8,
            color: 'rgba(0,0,0,0.45)', textTransform: 'uppercase',
          }}>{dateStr}</div>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700, fontSize: 30,
            letterSpacing: -1, color: '#000',
            lineHeight: 1.05, marginTop: 6,
            textTransform: 'uppercase',
          }}>Round Texel</div>
          <div style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 500, fontSize: 15,
            color: 'rgba(0,0,0,0.55)', marginTop: 2, letterSpacing: -0.2,
          }}>{t.edition} · {t.edition_word} {EVENT_EDITIE}{days > 0 ? ` · ${days} ${t.days_label}` : ''}</div>
        </div>

        {/* Lang toggle */}
        <Pressable
          onClick={() => setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length])}
          style={{
            padding: '7px 10px', borderRadius: 999,
            background: '#fff', border: '1px solid rgba(0,0,0,0.08)',
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, fontWeight: 600, color: '#000', letterSpacing: 0.4,
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{FLAGS[lang]}</span>
          {lang.toUpperCase()}
        </Pressable>
      </div>

      {/* Tiles */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0 16px 12px' }} className="scrollbar-none">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0, width: '100%' }}>
          <HomeTile
            variant="light"
            eyebrow="01 / Rating"
            title={t.tile_compare_title}
            sub={t.tile_compare_sub}
            meta={t.meta_compare}
            onClick={() => go('compare')}
          />
          <HomeTile
            variant="dark"
            eyebrow="02 / Agenda"
            title={t.tile_agenda_title}
            sub={t.tile_agenda_sub}
            meta={t.meta_agenda}
            onClick={() => go('agenda')}
          />
          <RegistrationsTile t={t} categories={registrationsData.categories} onClick={() => go('stats')} />
        <HomeTile
          variant="light"
          eyebrow="04 / Nieuws"
          title={t.tile_nieuws_title}
          sub={t.tile_nieuws_sub}
          onClick={() => go('nieuws')}
        />
        </div>
      </div>

      {/* Footer strip */}
      <div style={{
        padding: '16px 20px 28px',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: 'rgba(0,0,0,0.45)', letterSpacing: 0.4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: 999, background: '#000', boxShadow: '0 0 0 3px rgba(0,0,0,0.12)' }}/>
          {t.home_footer.toUpperCase()}
        </div>
        <div>v2.6</div>
      </div>
    </div>
  )
}
