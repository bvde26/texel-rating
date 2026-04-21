import { useEffect, useState } from 'react'
import { subscribeToNews } from '../services/newsService'
import { requestPushPermission } from '../services/pushService'
import { Icon } from '../components/icons'
import Pressable from '../components/Pressable'

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
  const [pushStatus, setPushStatus] = useState('idle') // idle | requested | granted | denied

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 8000)
    const unsub = subscribeToNews(
      (data) => { setItems(data); setLoading(false); clearTimeout(timer) },
      () => setLoading(false),
    )
    return () => { unsub(); clearTimeout(timer) }
  }, [])

  const handlePush = async () => {
    setPushStatus('requested')
    const token = await requestPushPermission()
    setPushStatus(token ? 'granted' : 'denied')
  }

  const pushLabel = {
    idle: lang === 'nl' ? 'Meldingen aan' : 'Enable notifications',
    requested: '...',
    granted: lang === 'nl' ? 'Meldingen actief ✓' : 'Notifications on ✓',
    denied: lang === 'nl' ? 'Niet toegestaan' : 'Permission denied',
  }

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
          {pushStatus !== 'granted' && (
            <Pressable
              onClick={handlePush}
              style={{
                padding: '6px 12px', borderRadius: 20,
                background: '#000', color: '#fff',
                fontFamily: 'Outfit, sans-serif', fontSize: 12, fontWeight: 600,
              }}
            >
              {pushLabel[pushStatus]}
            </Pressable>
          )}
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
            <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, lineHeight: 1.55, color: 'rgba(0,0,0,0.75)' }}>
              {item.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
