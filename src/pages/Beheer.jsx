import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { subscribeToNews, addNewsItem, deleteNewsItem } from '../services/newsService'
import { Icon } from '../components/icons'
import Pressable from '../components/Pressable'

function timeAgo(ts) {
  if (!ts) return ''
  const diff = (Date.now() - ts.toMillis()) / 1000
  if (diff < 60) return 'zojuist'
  if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`
  if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`
  return `${Math.floor(diff / 86400)} d geleden`
}

export default function Beheer({ onBack }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [sendStatus, setSendStatus] = useState('') // '' | 'ok' | 'err'

  const [items, setItems] = useState([])
  const [pushLoading, setPushLoading] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setAuthLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToNews(setItems)
    return unsub
  }, [user])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setLoginError(`Login fout: ${err?.code || err?.message || 'onbekend'}`)
    }
    setLoginLoading(false)
  }

  const [debugMsg, setDebugMsg] = useState('')

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) return
    const t = title.trim()
    const b = body.trim()
    setTitle('')
    setBody('')
    setSending(true)
    setDebugMsg('Versturen...')
    try {
      const result = await addNewsItem(t, b)
      setSendStatus('ok')
      setDebugMsg(`OK — push verstuurd naar ${result.pushSent ?? 0} apparaten ✓`)
      setTimeout(() => { setSendStatus(''); setDebugMsg('') }, 4000)
    } catch (err) {
      setSendStatus('err')
      setDebugMsg('ERR: ' + (err?.message || String(err)))
    } finally {
      setSending(false)
    }
  }

  if (authLoading) return null

  if (!user) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
        <div style={{ flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border2)' }}>
          <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <Pressable
              onClick={onBack}
              style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--chip)', border: '1px solid var(--border3)', marginLeft: -4 }}
            >
              <Icon.Back size={18} color="#000" />
            </Pressable>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 18, letterSpacing: -0.2 }}>Beheer</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
          <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: 360 }}>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 24, letterSpacing: -0.5 }}>Inloggen</div>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="E-mailadres" required
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border2)', background: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: 15, marginBottom: 10, boxSizing: 'border-box' }}
            />
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Wachtwoord" required
              style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border2)', background: '#fff', fontFamily: 'Outfit, sans-serif', fontSize: 15, marginBottom: 16, boxSizing: 'border-box' }}
            />
            {loginError && (
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#b00', marginBottom: 12 }}>{loginError}</div>
            )}
            <button
              type="submit" disabled={loginLoading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, background: '#000', color: '#fff', border: 'none', fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, cursor: loginLoading ? 'not-allowed' : 'pointer' }}
            >
              {loginLoading ? 'Bezig...' : 'Inloggen'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border2)' }}>
        <div style={{ padding: '18px 20px 14px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Pressable
            onClick={onBack}
            style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--chip)', border: '1px solid var(--border3)', marginLeft: -4 }}
          >
            <Icon.Back size={18} color="#000" />
          </Pressable>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 18, letterSpacing: -0.2, flex: 1 }}>Beheer</div>
          <Pressable
            onClick={() => signOut(auth)}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(0,0,0,0.5)', letterSpacing: 0.4 }}
          >
            UITLOGGEN
          </Pressable>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 40px' }} className="scrollbar-none">

        {/* Nieuw bericht */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginBottom: 12 }}>
            Nieuw bericht
          </div>
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Titel"
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border2)', fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, marginBottom: 10, boxSizing: 'border-box' }}
          />
          <textarea
            value={body} onChange={e => setBody(e.target.value)}
            placeholder="Bericht..."
            rows={4}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border2)', fontFamily: 'Outfit, sans-serif', fontSize: 14, lineHeight: 1.5, resize: 'none', boxSizing: 'border-box', marginBottom: 12 }}
          />
          <Pressable
            onClick={handlePost}
            style={{
              width: '100%', padding: '14px', borderRadius: 12,
              background: sending ? 'rgba(0,0,0,0.4)' : '#000',
              color: '#fff', textAlign: 'center',
              fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600,
              pointerEvents: sending ? 'none' : 'auto',
            }}
          >
            {sending ? 'Versturen...' : sendStatus === 'ok' ? 'Geplaatst ✓' : 'Plaatsen + Push sturen'}
          </Pressable>
          {debugMsg && (
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: sendStatus === 'err' ? '#b00' : '#060', marginTop: 8, wordBreak: 'break-all' }}>{debugMsg}</div>
          )}
        </div>

        {/* Bestaande berichten */}
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', marginBottom: 10 }}>
          Geplaatste berichten
        </div>
        {items.map((item) => (
          <div key={item.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 15, color: '#000', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'rgba(0,0,0,0.6)', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{item.body}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(0,0,0,0.35)', marginTop: 6 }}>{timeAgo(item.createdAt)}</div>
            </div>
            <Pressable
              onClick={() => deleteNewsItem(item.id)}
              style={{ padding: '6px', borderRadius: 8, background: 'rgba(180,0,0,0.06)', flexShrink: 0 }}
            >
              <Icon.Delete size={16} color="#b00" />
            </Pressable>
          </div>
        ))}
      </div>
    </div>
  )
}
