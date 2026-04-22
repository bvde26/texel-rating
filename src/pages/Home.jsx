import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/icons'
import Pressable from '../components/Pressable'
import { subscribeToNews } from '../services/newsService'

import registrationsData from '../data/registrations.json'

const EVENT_DATE = new Date('2026-06-06')
const EVENT_EDITIE = 47
const LANGS = ['nl', 'en', 'de', 'fr']
const FLAGS = { nl: '🇳🇱', en: '🇬🇧', de: '🇩🇪', fr: '🇫🇷' }

function daysUntil(date) {
  const now = new Date()
  const diff = date - new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function relativeTime(ms, lang) {
  if (!ms) return ''
  const sec = Math.max(0, (Date.now() - ms) / 1000)
  const L = {
    nl: { now: 'zojuist', min: 'min geleden', hr: 'uur geleden', day: 'd geleden' },
    en: { now: 'just now', min: 'min ago', hr: 'h ago', day: 'd ago' },
    de: { now: 'gerade eben', min: 'Min', hr: 'Std', day: 'T' },
    fr: { now: "à l'instant", min: 'min', hr: 'h', day: 'j' },
  }[lang] || { now: 'zojuist', min: 'min geleden', hr: 'uur geleden', day: 'd geleden' }
  if (sec < 60) return L.now
  if (sec < 3600) {
    const n = Math.floor(sec / 60)
    return lang === 'de' ? `vor ${n} ${L.min}` : lang === 'fr' ? `il y a ${n} ${L.min}` : `${n} ${L.min}`
  }
  if (sec < 86400) {
    const n = Math.floor(sec / 3600)
    return lang === 'de' ? `vor ${n} ${L.hr}` : lang === 'fr' ? `il y a ${n} ${L.hr}` : `${n} ${L.hr}`
  }
  const n = Math.floor(sec / 86400)
  return lang === 'de' ? `vor ${n} ${L.day}` : lang === 'fr' ? `il y a ${n} ${L.day}` : `${n} ${L.day}`
}

function useLatestNewsAt() {
  const [ms, setMs] = useState(null)
  useEffect(() => {
    const unsub = subscribeToNews(
      (items) => {
        const ts = items[0]?.createdAt
        if (ts && typeof ts.toMillis === 'function') setMs(ts.toMillis())
      },
      () => {},
    )
    return () => unsub && unsub()
  }, [])
  // Force re-render every 60s so relative time updates
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick(t => t + 1), 60000)
    return () => clearInterval(id)
  }, [])
  return ms
}

function HomeTile({ accent, icon: IconCmp, title, sub, chip, onClick }) {
  return (
    <Pressable onClick={onClick} className="tile" data-accent={accent}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div className="tile-icon">
          {IconCmp && <IconCmp size={20} color="var(--spring-ink)" />}
        </div>
        {chip && <div className="tile-chip">{chip}</div>}
      </div>
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: -0.9,
          lineHeight: 1,
          marginBottom: 6,
          textTransform: 'uppercase',
        }}>{title}</div>
        <div style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 400,
          fontSize: 14,
          color: 'var(--spring-ink-soft)',
          letterSpacing: -0.1,
        }}>{sub}</div>
      </div>
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
  const catTotal = (categories.catamaran_duo?.count || 0) + (categories.catamaran_single?.count || 0)
  const displayRows = [
    { label: t.cat_catamaran || 'Catamaran', count: catTotal },
    { label: t.cat_wingfoil, count: categories.wingfoil?.count || 0 },
    { label: t.cat_windsurf, count: categories.windsurf?.count || 0 },
  ]
  return (
    <Pressable onClick={onClick} className="tile" data-accent="mint">
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', gap: 10, marginBottom: 12, minWidth: 0,
      }}>
        <div className="tile-icon">
          <Icon.Users size={20} color="var(--spring-ink)" />
        </div>
        <div className="tile-chip"><b style={{ fontWeight: 700, marginRight: 4 }}>{total}</b>{t.tile_reg_eyebrow}</div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: -0.9,
          lineHeight: 1,
          marginBottom: 10,
          textTransform: 'uppercase',
        }}>{t.tile_reg_eyebrow}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
        {displayRows.map((row) => (
          <div key={row.label} style={{
            display: 'flex', alignItems: 'baseline', gap: 10,
            minWidth: 0, width: '100%',
          }}>
            <div style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: 14, color: 'var(--spring-ink-soft)',
              flex: '1 1 auto', minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{row.label}</div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14, fontWeight: 600,
              color: 'var(--spring-ink)',
              flex: '0 0 auto',
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
            }}>{row.count}</div>
          </div>
        ))}
      </div>
      </div>
    </Pressable>
  )
}

export default function Home({ t, lang, setLang, go }) {
  const days = daysUntil(EVENT_DATE)
  const latestNewsAt = useLatestNewsAt()
  const scrollRef = useRef(null)
  const [hasMoreBelow, setHasMoreBelow] = useState(false)
  const [hasMoreAbove, setHasMoreAbove] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      setHasMoreBelow(el.scrollHeight - el.clientHeight - el.scrollTop > 8)
      setHasMoreAbove(el.scrollTop > 8)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  const maskImage = (() => {
    if (!hasMoreAbove && !hasMoreBelow) return 'none'
    const top = hasMoreAbove ? 'transparent 0, black 56px' : 'black 0, black 0'
    const bottom = hasMoreBelow ? 'black calc(100% - 56px), transparent 100%' : 'black 100%, black 100%'
    return `linear-gradient(to bottom, ${top}, ${bottom})`
  })()
  const newsUpdatedLabel = {
    nl: 'LAATSTE UPDATE', en: 'LAST UPDATE', de: 'LETZTES UPDATE', fr: 'DERNIÈRE MAJ',
  }[lang] || 'LAATSTE UPDATE'
  const newsMeta = latestNewsAt ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 7, height: 7, borderRadius: 999,
        background: '#16a34a',
        boxShadow: '0 0 0 3px rgba(22,163,74,0.18)',
        display: 'inline-block',
      }}/>
      {newsUpdatedLabel} · {relativeTime(latestNewsAt, lang).toUpperCase()}
    </span>
  ) : null

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Brand header */}
      <div style={{ padding: '22px 20px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700, fontSize: 30,
            letterSpacing: -1, color: 'var(--spring-ink)',
            lineHeight: 1.05,
            textTransform: 'uppercase',
          }}>Round Texel</div>
          <div style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 500, fontSize: 15,
            color: 'var(--spring-ink-soft)', marginTop: 2, letterSpacing: -0.2,
          }}>{t.edition} · {t.edition_word} {EVENT_EDITIE}{days > 0 ? ` · ${t.days_until_prefix} ${days} ${t.days_label}` : ''}</div>
        </div>

        {/* Lang toggle */}
        <Pressable
          onClick={() => setLang(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length])}
          style={{
            padding: '7px 10px', borderRadius: 999,
            background: 'var(--spring-surface-strong)', border: '1px solid var(--spring-edge)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11, fontWeight: 600, color: 'var(--spring-ink)', letterSpacing: 0.4,
          }}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>{FLAGS[lang]}</span>
          {lang.toUpperCase()}
        </Pressable>
      </div>

      {/* Tiles */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '0 16px 12px',
          WebkitMaskImage: maskImage,
          maskImage: maskImage,
          transition: 'mask-image 200ms ease, -webkit-mask-image 200ms ease',
        }}
        className="scrollbar-none"
      >
        <div className="tile-grid">
          <HomeTile
            accent="coral"
            icon={Icon.Bell}
            title={t.tile_nieuws_title}
            sub={t.tile_nieuws_sub}
            chip={newsMeta}
            onClick={() => go('nieuws')}
          />
          <HomeTile
            accent="indigo"
            icon={Icon.Calendar}
            title={t.tile_agenda_title}
            sub={t.tile_agenda_sub}
            chip={t.meta_agenda}
            onClick={() => go('agenda')}
          />
          <RegistrationsTile t={t} categories={registrationsData.categories} onClick={() => go('stats')} />
          <HomeTile
            accent="sand"
            icon={Icon.Route}
            title={t.tile_rondje_title}
            sub={t.tile_rondje_sub}
            chip={t.meta_rondje}
            onClick={() => go('rondje')}
          />
          <HomeTile
            accent="moss"
            icon={Icon.Scale}
            title={t.tile_compare_title}
            sub={t.tile_compare_sub}
            chip={t.meta_compare}
            onClick={() => go('compare')}
          />
          <HomeTile
            accent="sky"
            icon={Icon.Wind}
            title={t.tile_weer_title}
            sub={t.tile_weer_sub}
            chip={t.meta_weer}
            onClick={() => go('weer')}
          />
          <HomeTile
            accent="ocean"
            icon={Icon.Camera}
            title={t.tile_webcams_title}
            sub={t.tile_webcams_sub}
            chip={t.meta_webcams}
            onClick={() => go('webcams')}
          />
        </div>
      </div>

      {/* Footer strip */}
      <div style={{
        padding: '16px 20px 28px',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color: 'var(--spring-ink-mute)', letterSpacing: 0.4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--accent-moss)', boxShadow: '0 0 0 3px rgba(127,183,126,0.25)' }}/>
          {t.home_footer.toUpperCase()}
        </div>
        <div>v{__APP_VERSION__}</div>
      </div>
    </div>
  )
}
