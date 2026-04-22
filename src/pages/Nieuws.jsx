import { useEffect, useState } from 'react'
import { subscribeToNews } from '../services/newsService'
import { requestPushPermission } from '../services/pushService'
import { Icon } from '../components/icons'
import Pressable from '../components/Pressable'

function renderBodyWithLinks(text) {
  if (!text) return null
  const parts = text.split(/((?:https?:\/\/|www\.)[^\s]+)/gi)
  return parts.map((part, i) => {
    if (/^(https?:\/\/|www\.)/i.test(part)) {
      const trailing = part.match(/[.,!?;:)]+$/)?.[0] || ''
      const url = trailing ? part.slice(0, -trailing.length) : part
      const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
      return (
        <span key={i}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0a6b2e', textDecoration: 'underline', wordBreak: 'break-all' }}
          >
            {url}
          </a>
          {trailing}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function timeAgo(ts) {
  if (!ts) return ''
  const diff = (Date.now() - ts.toMillis()) / 1000
  if (diff < 60) return 'zojuist'
  if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`
  if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`
  return `${Math.floor(diff / 86400)} dagen geleden`
}

export default function Nieuws({ onBack, lang }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [pushStatus, setPushStatus] = useState('idle') // idle | requested | granted | denied | unsupported
  const [showDeniedInfo, setShowDeniedInfo] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 8000)
    const unsub = subscribeToNews(
      (data) => { setItems(data); setLoading(false); clearTimeout(timer) },
      () => setLoading(false),
    )
    return () => { unsub(); clearTimeout(timer) }
  }, [])

  useEffect(() => {
    const init = async () => {
      if (typeof Notification === 'undefined') {
        setPushStatus('unsupported')
        return
      }
      const { isSupported } = await import('firebase/messaging')
      const supported = await isSupported()
      if (!supported) {
        setPushStatus('unsupported')
        return
      }
      if (Notification.permission === 'granted') setPushStatus('granted')
      else if (Notification.permission === 'denied') setPushStatus('denied')
    }
    init()
  }, [])

  const handlePush = async () => {
    if (pushStatus === 'denied') {
      setShowDeniedInfo(true)
      return
    }
    if (pushStatus === 'unsupported') return
    setPushStatus('requested')
    const token = await requestPushPermission()
    setPushStatus(token ? 'granted' : 'denied')
  }

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  const pushConfig = {
    idle: {
      label: lang === 'nl' ? 'Meldingen aan' : 'Enable notifications',
      bg: '#000', color: '#fff', icon: 'Bell',
    },
    requested: {
      label: lang === 'nl' ? 'Even geduld...' : 'Please wait...',
      bg: 'rgba(0,0,0,0.4)', color: '#fff', icon: 'Bell',
    },
    granted: {
      label: lang === 'nl' ? 'Meldingen aan' : 'Notifications on',
      bg: '#d1f4dd', color: '#0a6b2e', icon: 'Check',
    },
    denied: {
      label: lang === 'nl' ? 'Geblokkeerd' : 'Blocked',
      bg: '#fde2e2', color: '#a01010', icon: 'BellOff',
    },
    unsupported: {
      label: isStandalone
        ? (lang === 'nl' ? 'Niet ondersteund' : 'Not supported')
        : (lang === 'nl' ? 'Zet op beginscherm' : 'Add to home screen'),
      bg: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.55)', icon: 'Bell',
    },
  }
  const current = pushConfig[pushStatus]
  const IconComp = Icon[current.icon]

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
            {lang === 'nl' ? 'Nieuws' : 'News'}
          </div>
          <Pressable
            onClick={handlePush}
            style={{
              padding: '6px 12px 6px 10px', borderRadius: 20,
              background: current.bg, color: current.color,
              fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              flexShrink: 0,
            }}
          >
            <IconComp size={14} color={current.color} />
            {current.label}
          </Pressable>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 40px' }} className="scrollbar-none">
        {loading && (
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, color: 'rgba(0,0,0,0.4)', textAlign: 'center', paddingTop: 40 }}>
            Laden...
          </div>
        )}
        {!loading && items.length === 0 && (
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, color: 'rgba(0,0,0,0.4)', textAlign: 'center', paddingTop: 40 }}>
            {lang === 'nl' ? 'Nog geen berichten.' : 'No messages yet.'}
          </div>
        )}
        {showDeniedInfo && (
          <div style={{
            background: '#fff8e6', border: '1px solid #f5d878', borderRadius: 12,
            padding: '12px 14px', marginBottom: 14,
            fontFamily: 'Outfit, sans-serif', fontSize: 13, lineHeight: 1.5, color: '#5a4200',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {lang === 'nl' ? 'Meldingen staan uit' : 'Notifications are blocked'}
            </div>
            <div style={{ marginBottom: 6 }}>
              {lang === 'nl'
                ? 'Zet ze aan via je browser-instellingen: tik op het slotje (of info-icoon) in de adresbalk → Meldingen → Toestaan. Ververs daarna de pagina.'
                : 'Enable in browser settings: tap the lock (or info icon) in the address bar → Notifications → Allow. Then reload.'}
            </div>
            <Pressable onClick={() => setShowDeniedInfo(false)} style={{ fontSize: 11, fontWeight: 600, textDecoration: 'underline', color: '#5a4200' }}>
              {lang === 'nl' ? 'Sluiten' : 'Close'}
            </Pressable>
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} style={{
            background: '#fff', borderRadius: 16,
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 2px 8px -4px rgba(0,0,0,0.08)',
            padding: '16px 18px', marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 16, letterSpacing: -0.2, color: '#000' }}>
                {item.title}
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(0,0,0,0.4)', letterSpacing: 0.3, flexShrink: 0, paddingTop: 3 }}>
                {timeAgo(item.createdAt)}
              </div>
            </div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, lineHeight: 1.55, color: 'rgba(0,0,0,0.75)', whiteSpace: 'pre-wrap' }}>
              {renderBodyWithLinks(item.body)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
