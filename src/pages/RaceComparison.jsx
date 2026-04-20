import { useState, useMemo, useRef, useEffect } from 'react'
import boats from '../data/boats.json'
import registrations from '../data/registrations.json'
import { Icon } from '../components/icons'
import Pressable from '../components/Pressable'
import BoatPicker from '../components/BoatPicker'

const getTR = (boat, spi) => spi && boat.trWithSpi ? boat.trWithSpi : boat.trNoSpi

function fmtTime(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function fmtDelta(sec) {
  const sign = sec >= 0 ? '+' : '-'
  const abs = Math.abs(sec)
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = Math.floor(abs % 60)
  if (h > 0) return `${sign}${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${sign}${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

function SectionLabel({ children, right }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
      color: 'rgba(0,0,0,0.5)', letterSpacing: 0.8, textTransform: 'uppercase',
      marginBottom: 8, padding: '0 2px',
    }}>
      <span>{children}</span>
      {right}
    </div>
  )
}

function TimeField({ h, m, s, active, onTap, t }) {
  const seg = (val, label, key) => {
    const on = active === key
    return (
      <Pressable
        onClick={() => onTap(key)}
        style={{ padding: '10px 4px 8px', borderBottom: `2px solid ${on ? '#000' : 'rgba(0,0,0,0.12)'}`, minWidth: 60, textAlign: 'center' }}
      >
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 40, fontWeight: 600,
          color: val === null ? 'rgba(0,0,0,0.2)' : '#000',
          letterSpacing: -1.5, lineHeight: 1,
        }}>
          {val === null ? '00' : String(val).padStart(2, '0')}
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: 'rgba(0,0,0,0.45)', marginTop: 6, letterSpacing: 0.8, textTransform: 'uppercase',
        }}>{label}</div>
      </Pressable>
    )
  }
  const sep = (
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, color: 'rgba(0,0,0,0.2)', paddingBottom: 18, fontWeight: 500 }}>:</div>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
      {seg(h, t.h, 'h')}{sep}{seg(m, t.m, 'm')}{sep}{seg(s, t.s, 's')}
    </div>
  )
}

function Keypad({ onPress, onBackspace, onDone, doneLabel }) {
  const keys = ['1','2','3','4','5','6','7','8','9']
  const cell = (content, onClick, opts = {}) => (
    <Pressable
      key={opts.k}
      onClick={onClick}
      style={{
        height: 60, borderRadius: 14,
        background: opts.accent ? '#000' : (opts.subtle ? 'transparent' : '#fff'),
        color: opts.accent ? '#fff' : '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 24,
        boxShadow: opts.subtle ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
        border: opts.subtle ? 'none' : '1px solid rgba(0,0,0,0.06)',
        letterSpacing: -0.5,
      }}
    >{content}</Pressable>
  )
  return (
    <div style={{
      padding: '14px 16px 28px', background: 'var(--keypad)',
      borderTop: '1px solid var(--border)',
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
    }}>
      {keys.map(k => cell(k, () => onPress(k), { k }))}
      {cell(<Icon.Delete color="#000"/>, onBackspace, { k: 'bs', subtle: true })}
      {cell('0', () => onPress('0'), { k: '0' })}
      {cell(doneLabel, onDone, { k: 'done', accent: true })}
    </div>
  )
}

function SwipeableCard({ onDelete, onRight, radius = 12, cardPadding = '12px 14px', background = 'var(--surface)', children }) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(null)
  const startOffset = useRef(0)
  const capturing = useRef(false)
  const REVEAL = 72
  const THRESHOLD = 8

  const maxRight = onRight ? REVEAL + 12 : 0
  const maxLeft  = onDelete ? -(REVEAL + 12) : 0

  const onPointerDown = (e) => {
    startX.current = e.clientX
    startOffset.current = offset
    capturing.current = false
  }
  const onPointerMove = (e) => {
    if (startX.current === null) return
    const moved = e.clientX - startX.current
    if (!capturing.current) {
      if (Math.abs(moved) < THRESHOLD) return
      capturing.current = true
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    setOffset(Math.min(Math.max(startOffset.current + moved, maxLeft), maxRight))
  }
  const onPointerUp = () => {
    if (capturing.current) {
      setDragging(false)
      setOffset(prev => {
        if (prev <= -REVEAL / 2) return -REVEAL
        if (prev >= REVEAL / 2) return REVEAL
        return 0
      })
    }
    startX.current = null
    capturing.current = false
  }

  return (
    <div style={{ position: 'relative', borderRadius: radius, overflow: 'hidden' }}>
      {onRight && (
        <div onClick={() => { onRight(); setOffset(0) }} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: REVEAL, background: '#86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon.Plus color="#166534" size={22}/>
        </div>
      )}
      {onDelete && (
        <div onClick={() => { onDelete(); setOffset(0) }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: REVEAL, background: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon.Trash color="#991b1b" size={20}/>
        </div>
      )}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 280ms cubic-bezier(0.22,1,0.36,1), background 200ms ease',
          touchAction: 'pan-y',
          background,
          borderRadius: radius,
          border: '1px solid var(--border)',
          padding: cardPadding,
        }}
      >
        {children}
      </div>
    </div>
  )
}

function SpiChip({ value, onChange, label }) {
  return (
    <Pressable
      onClick={() => onChange(!value)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', padding: '5px 8px', borderRadius: 8 }}
    >
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700,
        letterSpacing: 0.8, textTransform: 'uppercase',
        color: value ? 'rgba(22,163,74,0.35)' : 'rgba(0,0,0,0.3)',
        transition: 'color 200ms',
      }}>{label}</span>
      <span style={{
        position: 'absolute', right: -6, top: '50%',
        transform: 'translateY(-52%) rotate(-10deg)',
        fontSize: 44, lineHeight: 1,
        color: value ? '#16a34a' : 'rgba(0,0,0,0.18)',
        pointerEvents: 'none', transition: 'color 200ms',
      }}>{value ? '✔' : '✘'}</span>
    </Pressable>
  )
}

function SpiChipSmall({ value, onChange }) {
  return (
    <Pressable
      onClick={() => onChange(!value)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: 7 }}
    >
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700,
        letterSpacing: 0.6,
        color: value ? 'rgba(22,163,74,0.35)' : 'rgba(0,0,0,0.3)',
        transition: 'color 200ms',
      }}>SPI</span>
      <span style={{
        position: 'absolute', right: -4, top: '50%',
        transform: 'translateY(-52%) rotate(-10deg)',
        fontSize: 26, lineHeight: 1,
        color: value ? '#16a34a' : 'rgba(0,0,0,0.18)',
        pointerEvents: 'none', transition: 'color 200ms',
      }}>{value ? '✔' : '✘'}</span>
    </Pressable>
  )
}

const emptyTime = () => ({ h: null, m: null, s: null })

function CompactTimeField({ time, activeField, onTap }) {
  const seg = (val, key) => (
    <span
      onClick={(e) => { e.stopPropagation(); onTap(key) }}
      style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 600,
        letterSpacing: -0.3, padding: '1px 5px 3px',
        color: activeField === key ? '#000' : 'rgba(0,0,0,0.35)',
        borderBottom: `2px solid ${activeField === key ? '#000' : 'rgba(0,0,0,0.12)'}`,
        background: activeField === key ? 'rgba(0,0,0,0.04)' : 'transparent',
        borderRadius: '4px 4px 0 0',
        cursor: 'pointer', userSelect: 'none',
        transition: 'color 150ms, border-color 150ms',
      }}
    >
      {val === null ? '00' : String(val).padStart(2, '0')}
    </span>
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {seg(time.h, 'h')}
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'rgba(0,0,0,0.25)', paddingBottom: 2 }}>:</span>
      {seg(time.m, 'm')}
      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'rgba(0,0,0,0.25)', paddingBottom: 2 }}>:</span>
      {seg(time.s, 's')}
    </div>
  )
}

function MyBoatCard({ boat, reg, spi, setSpi, time, activeField, setActiveField, timeComplete, elapsed, myTR, t, onRight, onDelete }) {
  return (
    <SwipeableCard onRight={onRight} onDelete={onDelete} radius={16} cardPadding="14px 16px">
      {/* Naam + TX inline, namen eronder, SPI klein */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, overflow: 'hidden' }}>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 18, letterSpacing: -0.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
          {boat.type}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(0,0,0,0.5)', letterSpacing: 0.2, flexShrink: 0 }}>
          TX {myTR}
        </div>
      </div>
      {reg?.skipper && (
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(0,0,0,0.5)', marginTop: 1, letterSpacing: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {reg.sailNumber && `${reg.sailNumber} · `}{reg.skipper}{reg.crew ? ` / ${reg.crew}` : ''}
        </div>
      )}
      <div style={{ marginTop: 4, marginLeft: -8 }}>
        <SpiChipSmall value={spi} onChange={setSpi}/>
      </div>
      <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '8px -16px' }}/>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(0,0,0,0.45)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>
        {t.finish_time}
      </div>
      <TimeField h={time.h} m={time.m} s={time.s} active={activeField} onTap={setActiveField} t={t}/>
      {timeComplete && (
        <>
          <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '10px -16px' }}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(0,0,0,0.45)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
              TX {myTR} NETTO
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, letterSpacing: -0.8, color: '#000' }}>
              {fmtTime(Math.round(elapsed * 100 / myTR))}
            </div>
          </div>
        </>
      )}
    </SwipeableCard>
  )
}

export default function RaceComparison({ t, onBack }) {
  // Compare mode state
  const [myBoat, setMyBoat] = useState(null)
  const [myReg, setMyReg] = useState(null)
  const [spi, setSpi] = useState(false)
  const [time, setTime] = useState(emptyTime())
  const [activeField, setActiveField] = useState('h')
  const [competitors, setCompetitors] = useState([])

  // Rank mode state
  const [mode, setMode] = useState('compare')
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem('texel-rank-entries') || '[]') } catch { return [] }
  })
  const [rankOrder, setRankOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('texel-rank-order') || '[]') } catch { return [] }
  })
  const [editUid, setEditUid] = useState(null)
  const [editField, setEditField] = useState('h')
  const [selectedUid, setSelectedUid] = useState(null)

  useEffect(() => { localStorage.setItem('texel-rank-entries', JSON.stringify(entries)) }, [entries])
  useEffect(() => { localStorage.setItem('texel-rank-order', JSON.stringify(rankOrder)) }, [rankOrder])

  // Shared
  const [picker, setPicker] = useState(null)
  const [toast, setToast] = useState(false)

  const addToRanking = (id, spi, existingTime = emptyTime(), regInfo = null) => {
    const uid = Date.now() + Math.random()
    const newEntry = { uid, id, spi, time: existingTime, ...regInfo && { skipper: regInfo.skipper, crew: regInfo.crew, sailNumber: regInfo.sailNumber } }
    const updatedEntries = [...entries, newEntry]
    setEntries(updatedEntries)
    setRankOrder(o => [...o, uid])
    applySort(updatedEntries)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
  }

  // Compare helpers
  const timeComplete = time.h !== null && time.m !== null && time.s !== null
  const elapsed = timeComplete ? time.h * 3600 + time.m * 60 + time.s : 0
  const myTR = myBoat ? getTR(myBoat, spi) : null

  const press = (digit) => {
    setTime(prev => {
      const cur = prev[activeField]
      let next
      if (cur === null) next = parseInt(digit, 10)
      else next = parseInt((String(cur) + digit).slice(-2), 10)
      const caps = { h: 23, m: 59, s: 59 }
      if (next > caps[activeField]) next = caps[activeField]
      const out = { ...prev, [activeField]: next }
      if (activeField === 'h' && out.h >= 3) setActiveField('m')
      else if (activeField === 'h' && String(out.h).length >= 2) setActiveField('m')
      else if (activeField === 'm' && String(out.m).length >= 2) setActiveField('s')
      return out
    })
  }
  const backspace = () => setTime(prev => ({ ...prev, [activeField]: null }))
  const done = () => {
    setTime(prev => ({ h: prev.h ?? 0, m: prev.m ?? 0, s: prev.s ?? 0 }))
    setActiveField(null)
  }

  // Rank helpers
  const correctedSec = (entry) => {
    const { h, m, s } = entry.time
    if (h === null && m === null && s === null) return null
    const el = (h ?? 0) * 3600 + (m ?? 0) * 60 + (s ?? 0)
    const boat = boats.boats.find(b => b.id === entry.id)
    if (!boat) return null
    return Math.round(el * 100 / getTR(boat, entry.spi))
  }

  const applySort = (updatedEntries) => {
    setRankOrder(order => [...order].sort((aUid, bUid) => {
      const a = updatedEntries.find(e => e.uid === aUid)
      const b = updatedEntries.find(e => e.uid === bUid)
      const ca = a ? correctedSec(a) : null
      const cb = b ? correctedSec(b) : null
      if (ca === null && cb === null) return 0
      if (ca === null) return 1
      if (cb === null) return -1
      return ca - cb
    }))
  }

  // Sort on mount to fix localStorage load order
  useEffect(() => { applySort(entries) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const advanceField = (field, val, setter) => {
    if (field === 'h' && (val >= 3 || String(val).length >= 2)) setter('m')
    else if (field === 'm' && String(val).length >= 2) setter('s')
  }

  const rankPress = (digit) => {
    setEntries(prev => prev.map(e => {
      if (e.uid !== editUid) return e
      const cur = e.time[editField]
      let next
      if (cur === null) next = parseInt(digit, 10)
      else next = parseInt((String(cur) + digit).slice(-2), 10)
      const caps = { h: 23, m: 59, s: 59 }
      if (next > caps[editField]) next = caps[editField]
      advanceField(editField, next, setEditField)
      return { ...e, time: { ...e.time, [editField]: next } }
    }))
  }
  const rankBackspace = () => {
    setEntries(prev => prev.map(e =>
      e.uid === editUid ? { ...e, time: { ...e.time, [editField]: null } } : e
    ))
  }
  const rankDone = () => {
    const committed = entries.map(e =>
      e.uid === editUid
        ? { ...e, time: { h: e.time.h ?? 0, m: e.time.m ?? 0, s: e.time.s ?? 0 } }
        : e
    )
    setEntries(committed)
    applySort(committed)
    setEditUid(null)
  }

  const displayEntries = rankOrder.map(uid => entries.find(e => e.uid === uid)).filter(Boolean)

  const resetAll = () => {
    setMyBoat(null)
    setMyReg(null)
    setTime(emptyTime())
    setActiveField('h')
    setCompetitors([])
    setSpi(false)
    setEntries([])
    setRankOrder([])
    setEditUid(null)
  }

  const resetRank = () => {
    setEntries([])
    setRankOrder([])
    setEditUid(null)
  }

  const hasState = myBoat || timeComplete || competitors.length > 0 || entries.length > 0

  const results = useMemo(() => {
    if (!myBoat || !myTR) return []
    return competitors.map(({ uid, id, spi: cSpi, skipper, crew, sailNumber }) => {
      const boat = boats.boats.find(b => b.id === id)
      if (!boat) return null
      const compTR = getTR(boat, cSpi)
      const diff = timeComplete ? (elapsed * (compTR / myTR)) - elapsed : null
      return { uid, boat, cSpi, compTR, diff, skipper, crew, sailNumber }
    }).filter(Boolean).sort((a, b) => (b.diff ?? -Infinity) - (a.diff ?? -Infinity))
  }, [myBoat, timeComplete, elapsed, myTR, competitors])

  const showKeypad = mode === 'compare'
    ? (activeField !== null && myBoat !== null)
    : (editUid !== null)

  return (
    <div style={{ height: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--surface)', color: '#000',
        padding: '18px 20px 0',
        borderBottom: '1px solid var(--border2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 40, marginBottom: 12 }}>
          <Pressable
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--chip)', border: '1px solid var(--border3)', marginLeft: -4,
            }}
          >
            <Icon.Back size={18} color="#000"/>
          </Pressable>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 18, letterSpacing: -0.2, flex: 1 }}>
            {t.compare_title}
          </div>
          {hasState && (
            <Pressable
              onClick={mode === 'rank' ? resetRank : resetAll}
              style={{
                padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.05)',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(0,0,0,0.65)', letterSpacing: 0.5, fontWeight: 600,
              }}
            >{t.reset.toUpperCase()}</Pressable>
          )}
        </div>

        {/* Mode tabs */}
        <div style={{ display: 'flex' }}>
          {[['compare', t.compare_title], ['rank', t.ranking]].map(([m, label]) => (
            <Pressable
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '10px 4px', textAlign: 'center',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700,
                letterSpacing: 0.6, textTransform: 'uppercase',
                color: mode === m ? '#000' : 'rgba(0,0,0,0.35)',
                borderBottom: `2px solid ${mode === m ? '#000' : 'transparent'}`,
                transition: 'color 200ms, border-color 200ms',
              }}
            >
              {label}
              {m === 'rank' && entries.length > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#16a34a', color: '#fff', fontSize: 9, fontWeight: 800, width: 15, height: 15, borderRadius: 999, marginLeft: 5, verticalAlign: 'middle' }}>{entries.length}</span>
              )}
            </Pressable>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: showKeypad ? 0 : 24 }} className="scrollbar-none" onClick={() => { setEditUid(null); setSelectedUid(null) }}>

        {/* ── COMPARE MODE ── */}
        {mode === 'compare' && (
          <>
            {/* Your boat — combined tile */}
            <div style={{ padding: '16px 16px 8px' }}>
              <SectionLabel>{t.your_boat}</SectionLabel>
              {myBoat ? (
                <MyBoatCard
                  boat={myBoat}
                  reg={myReg}
                  spi={spi} setSpi={setSpi}
                  time={time} activeField={activeField} setActiveField={setActiveField}
                  timeComplete={timeComplete} elapsed={elapsed} myTR={myTR}
                  t={t}
                  onRight={() => addToRanking(myBoat.id, spi, timeComplete ? { ...time } : emptyTime())}
                  onDelete={() => { setMyBoat(null); setMyReg(null); setSpi(false); setTime(emptyTime()); setActiveField('h') }}
                />
              ) : (
                <Pressable
                  onClick={() => setPicker('me')}
                  style={{
                    background: 'var(--surface)', borderRadius: 16,
                    border: '1px dashed rgba(0,0,0,0.2)',
                    padding: '22px 16px', display: 'flex', alignItems: 'center', gap: 12,
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon.Plus color="#fff" size={18}/>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 16, color: '#000', letterSpacing: -0.2 }}>{t.pick_boat}</div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13, color: 'rgba(0,0,0,0.55)', marginTop: 2 }}>{t.search_placeholder}</div>
                  </div>
                </Pressable>
              )}
            </div>

            {/* Intro when no boat */}
            {!myBoat && (
              <div style={{ margin: '8px 16px 20px', padding: '16px', background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(0,0,0,0.45)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 }}>HOE WERKT HET</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 13.5, lineHeight: 1.55, color: 'rgba(0,0,0,0.7)' }}>
                  Kies je boot, geef aan of je met spinnaker vaart, vul je eindtijd in en voeg concurrenten toe. Je ziet direct wie tijd voor of achter heeft.
                </div>
              </div>
            )}

            {/* Competitors */}
            {myBoat && (
              <div style={{ padding: '12px 16px 8px' }}>
                <SectionLabel
                >{t.competitors}</SectionLabel>
                <div style={{ display: 'grid', gap: 8 }}>
                  {results.map(({ uid, boat, cSpi, compTR, diff, skipper, crew, sailNumber }) => {
                    const positive = diff >= 0
                    const color = positive ? 'var(--win)' : 'var(--loss)'
                    const toggleSpi = (v) => setCompetitors(cs => cs.map(c => c.uid === uid ? { ...c, spi: v } : c))
                    return (
                      <SwipeableCard
                        key={uid}
                        onRight={() => addToRanking(boat.id, cSpi, emptyTime(), skipper ? { skipper, crew, sailNumber } : null)}
                        onDelete={() => setCompetitors(cs => cs.filter(c => c.uid !== uid))}
                      >
                        {/* Row 1: naam + TX grijs | diff rechts */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, overflow: 'hidden' }}>
                              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 15, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                {boat.type}
                              </div>
                              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(0,0,0,0.5)', letterSpacing: 0.2, flexShrink: 0 }}>
                                TX {compTR}
                              </div>
                            </div>
                            {skipper && (
                              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(0,0,0,0.5)', marginTop: 1, letterSpacing: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {sailNumber && `${sailNumber} · `}{skipper}{crew ? ` / ${crew}` : ''}
                              </div>
                            )}
                          </div>
                          {diff !== null ? (
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600, color, letterSpacing: -0.5, lineHeight: 1 }}>
                                {fmtDelta(diff)}
                              </div>
                              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color, letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 3, opacity: 0.8 }}>
                                {positive ? t.advantage : t.disadvantage}
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(0,0,0,0.3)', flexShrink: 0 }}>—</div>
                          )}
                        </div>
                        {/* Row 3: SPI chip linksonder */}
                        <div style={{ marginTop: 4, marginLeft: -8 }}>
                          <SpiChipSmall value={cSpi} onChange={toggleSpi}/>
                        </div>
                      </SwipeableCard>
                    )
                  })}
                  <Pressable
                    onClick={() => setPicker('comp')}
                    style={{ padding: 14, borderRadius: 12, border: '1px dashed rgba(0,0,0,0.18)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.6)' }}
                  >
                    <Icon.Plus size={16} color="rgba(0,0,0,0.6)"/>
                    {t.add_competitor}
                  </Pressable>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── RANK MODE ── */}
        {mode === 'rank' && (
          <div style={{ padding: '16px 16px 8px' }}>
            <div style={{ display: 'grid', gap: 8 }}>
              {displayEntries.map((entry, idx) => {
                const boat = boats.boats.find(b => b.id === entry.id)
                if (!boat) return null
                const cs = correctedSec(entry)
                const hasTime = cs !== null
                const elapsedSec = hasTime
                  ? (entry.time.h ?? 0) * 3600 + (entry.time.m ?? 0) * 60 + (entry.time.s ?? 0)
                  : null
                const tr = getTR(boat, entry.spi)
                return (
                  <div key={entry.uid} onClick={e => e.stopPropagation()}>
                  <SwipeableCard
                    onDelete={() => { setEntries(es => es.filter(e => e.uid !== entry.uid)); setRankOrder(o => o.filter(u => u !== entry.uid)) }}
                    background={selectedUid === entry.uid ? '#eff6ff' : 'var(--surface)'}
                  >
                    {/* Top row: rank + name + TR + SPI */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: hasTime ? '#000' : 'rgba(0,0,0,0.2)', width: 24, flexShrink: 0, letterSpacing: -0.3 }}>
                        {hasTime ? `#${idx + 1}` : '—'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 15, letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {boat.type}
                        </div>
                        {entry.skipper && (
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(0,0,0,0.5)', marginTop: 1, letterSpacing: 0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.sailNumber && `${entry.sailNumber} · `}{entry.skipper}{entry.crew ? ` / ${entry.crew}` : ''}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: -8 }}>
                          <SpiChipSmall
                            value={entry.spi}
                            onChange={(v) => {
                              const updated = entries.map(e => e.uid === entry.uid ? { ...e, spi: v } : e)
                              setEntries(updated)
                              applySort(updated)
                              setSelectedUid(entry.uid)
                            }}
                          />
                          <div style={{ display: 'flex', gap: 0, paddingBottom: 1 }}>
                            {Array.from({ length: boat.crew ?? 1 }).map((_, i) => (
                              <Icon.Person key={i} size={13} color="rgba(0,0,0,0.3)"/>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#000', letterSpacing: -0.3, flexShrink: 0 }}>
                        TX {tr}
                      </div>
                    </div>

                    {/* Vaartijd row */}
                    <div
                      onClick={() => { if (editUid !== entry.uid) { setEditUid(entry.uid); setEditField('h') } setSelectedUid(entry.uid) }}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', paddingLeft: 32, borderTop: '1px dashed rgba(0,0,0,0.08)', cursor: 'pointer' }}
                    >
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(0,0,0,0.45)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                        {t.finish_time}
                      </div>
                      {editUid === entry.uid ? (
                        <CompactTimeField time={entry.time} activeField={editField} onTap={setEditField}/>
                      ) : (
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 400, letterSpacing: -0.3, color: hasTime ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)' }}>
                          {hasTime ? fmtTime(elapsedSec) : t.tap_to_set}
                        </div>
                      )}
                    </div>

                    {/* TX-netto row */}
                    {hasTime && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0', paddingLeft: 32 }}>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(0,0,0,0.45)', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                          TX {tr} NETTO
                        </div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, letterSpacing: -0.3, color: '#000' }}>
                          {fmtTime(cs)}
                        </div>
                      </div>
                    )}
                  </SwipeableCard>
                  </div>
                )
              })}

              {/* Add boat button */}
              <Pressable
                onClick={() => setPicker('rank')}
                style={{ padding: 14, borderRadius: 12, border: '1px dashed rgba(0,0,0,0.18)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 14, color: 'rgba(0,0,0,0.6)' }}
              >
                <Icon.Plus size={16} color="rgba(0,0,0,0.6)"/>
                {t.add_boat}
              </Pressable>
            </div>
          </div>
        )}
      </div>

      {/* Keypad */}
      {showKeypad && (
        <Keypad
          onPress={mode === 'compare' ? press : rankPress}
          onBackspace={mode === 'compare' ? backspace : rankBackspace}
          onDone={mode === 'compare' ? done : rankDone}
          doneLabel={t.done}
        />
      )}

      {/* Toast */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: '#16a34a', color: '#fff',
        padding: '10px 20px', borderRadius: 12,
        fontFamily: 'Outfit, sans-serif', fontSize: 14, fontWeight: 600,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        zIndex: 50, whiteSpace: 'nowrap', pointerEvents: 'none',
        opacity: toast ? 1 : 0,
        transition: 'opacity 300ms',
      }}>✓ Toegevoegd aan uitslag</div>

      {/* Boat picker sheet */}
      {picker && (
        <BoatPicker
          t={t}
          boats={boats.boats}
          excludeIds={[]}
          onPick={(b, reg) => {
            const regSpi = reg?.spinnaker ?? false
            if (picker === 'me') {
              setMyBoat(b)
              setMyReg(reg ?? null)
              setSpi(regSpi)
              setCompetitors(cs => cs.filter(c => c.id !== b.id))
            } else if (picker === 'comp') {
              setCompetitors(cs => [...cs, { uid: Date.now() + Math.random(), id: b.id, spi: regSpi, skipper: reg?.skipper, crew: reg?.crew, sailNumber: reg?.sailNumber }])
            } else if (picker === 'rank') {
              addToRanking(b.id, regSpi, emptyTime(), reg)
            }
            setPicker(null)
          }}
          registrations={registrations.boats}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}
