import { useState, useMemo, useRef, useEffect } from 'react'
import boats from '../data/boats.json'

function SpiToggle({ value, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl"
      style={{ backgroundColor: 'var(--surface2)' }}>
      {[false, true].map(v => (
        <button key={String(v)} onClick={() => onChange(v)}
          className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
          style={{
            backgroundColor: value === v ? 'var(--surface)' : 'transparent',
            color: value === v ? 'var(--text)' : 'var(--text3)',
            boxShadow: value === v ? '0 1px 4px rgba(12,30,48,0.10)' : 'none',
          }}>
          {v ? 'Met spi' : 'Geen spi'}
        </button>
      ))}
    </div>
  )
}

function BoatPicker({ placeholder, excludeIds = [], onSelect }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = useMemo(() =>
    boats.boats
      .filter(b => !excludeIds.includes(b.id) && b.type.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.type.localeCompare(b.type))
  , [search, excludeIds])

  return (
    <div ref={ref} className="relative">
      <input type="text" placeholder={placeholder} value={search}
        onChange={e => { setSearch(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className="w-full px-4 py-3.5 rounded-xl text-[15px] focus:outline-none"
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--text)',
          boxShadow: '0 1px 4px rgba(12,30,48,0.06), 0 6px 20px rgba(12,30,48,0.05)',
        }}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-10 w-full rounded-xl mt-1.5 overflow-hidden"
          style={{
            backgroundColor: 'var(--surface)',
            boxShadow: '0 4px 24px rgba(12,30,48,0.14)',
            maxHeight: '256px', overflowY: 'auto',
          }}>
          {filtered.map(b => (
            <button key={b.id}
              onMouseDown={() => { onSelect(b); setSearch(''); setOpen(false) }}
              className="row w-full text-left flex items-center justify-between">
              <span className="text-[15px] font-medium" style={{ color: 'var(--text)' }}>{b.type}</span>
              <span className="text-xs font-['DM_Mono'] ml-2 shrink-0" style={{ color: 'var(--text2)' }}>
                TR {b.trNoSpi}{b.trWithSpi ? `/${b.trWithSpi}` : ''}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const getTR = (boat, spi) => spi && boat.trWithSpi ? boat.trWithSpi : boat.trNoSpi

export default function RaceComparison() {
  const [selectedBoat, setSelectedBoat] = useState(null)
  const [ownSpi, setOwnSpi] = useState(false)
  const [finishTime, setFinishTime] = useState('04:00')
  const [compBoats, setCompBoats] = useState([])

  const finishSec = useMemo(() => {
    const [h, m] = finishTime.split(':').map(Number)
    return (h * 60 + m) * 60
  }, [finishTime])

  const ownTR = selectedBoat ? getTR(selectedBoat, ownSpi) : null

  const results = useMemo(() => {
    if (!selectedBoat || !finishSec || !ownTR) return []
    return compBoats.map(({ boat, spi }) => {
      const compTR = getTR(boat, spi)
      const allowed = finishSec * (compTR / ownTR)
      const diff = allowed - finishSec
      return { boat, spi, compTR, allowed, diff }
    })
  }, [selectedBoat, finishSec, compBoats, ownTR])

  const fmtTime = s => {
    const m = Math.round(s / 60), h = Math.floor(m / 60)
    return `${h}:${String(m % 60).padStart(2, '0')}`
  }

  const fmtDiff = s => {
    const abs = Math.abs(Math.round(s / 60))
    const h = Math.floor(abs / 60), m = abs % 60
    return h > 0 ? `${h}u ${m}m` : `${m} min`
  }

  const excludeIds = [selectedBoat?.id, ...compBoats.map(b => b.boat.id)].filter(Boolean)

  return (
    <div>
      <p className="section-title">Eigen boot</p>

      {!selectedBoat ? (
        <BoatPicker placeholder="Zoek je boot…" excludeIds={[]} onSelect={setSelectedBoat} />
      ) : (
        <div className="card">
          <div className="row flex items-center justify-between">
            <div>
              <p className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>{selectedBoat.type}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                {selectedBoat.class} · TR{' '}
                <span className="font-['DM_Mono'] font-medium" style={{ color: 'var(--accent)' }}>{ownTR}</span>
              </p>
            </div>
            <button onClick={() => { setSelectedBoat(null); setCompBoats([]) }}
              className="text-sm font-semibold px-3.5 py-1.5 rounded-lg"
              style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}>
              Wijzig
            </button>
          </div>
          <div className="row">
            <SpiToggle value={ownSpi} onChange={setOwnSpi} />
          </div>
          <div className="row flex items-center justify-between">
            <span className="text-[15px] font-medium" style={{ color: 'var(--text)' }}>Racetijd</span>
            <input type="time" value={finishTime}
              onChange={e => setFinishTime(e.target.value)}
              className="text-[15px] font-['DM_Mono'] focus:outline-none bg-transparent font-medium"
              style={{ color: 'var(--accent)' }} />
          </div>
        </div>
      )}

      {/* Results */}
      {results.map(({ boat, spi, compTR, allowed, diff }) => (
        <div key={boat.id}>
          <p className="section-title">{boat.type}</p>
          <div className="card" style={{ backgroundColor: diff >= 0 ? 'var(--green-bg)' : 'var(--red-bg)' }}>
            <div className="row flex items-center justify-between">
              <div>
                <p className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>{boat.type}</p>
                <p className="text-xs mt-0.5 font-['DM_Mono']" style={{ color: 'var(--text2)' }}>TR {compTR}</p>
              </div>
              <button onClick={() => setCompBoats(p => p.filter(b => b.boat.id !== boat.id))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg leading-none"
                style={{ backgroundColor: 'rgba(12,30,48,0.07)', color: 'var(--text2)' }}>
                ×
              </button>
            </div>
            <div className="row">
              <SpiToggle value={spi}
                onChange={() => setCompBoats(p => p.map(b => b.boat.id === boat.id ? { ...b, spi: !b.spi } : b))} />
            </div>
            <div className="row flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-wide uppercase mb-1"
                  style={{ color: diff >= 0 ? 'var(--green)' : 'var(--red)', opacity: 0.7 }}>
                  Max. tijd
                </p>
                <p className="font-['DM_Mono'] text-xl font-medium"
                  style={{ color: diff >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {fmtTime(allowed)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-['Bebas_Neue'] text-[56px] leading-none tracking-wide"
                  style={{ color: diff >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {diff >= 0 ? '+' : '−'}{fmtDiff(diff)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                  {diff >= 0 ? 'mag langer doen' : 'eerder finishen'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add boat */}
      {selectedBoat && (
        <div>
          <p className="section-title">
            {compBoats.length === 0 ? 'Concurrent toevoegen' : 'Nog een toevoegen'}
          </p>
          <BoatPicker placeholder="Zoek boot…" excludeIds={excludeIds}
            onSelect={b => !compBoats.find(c => c.boat.id === b.id) && setCompBoats(p => [...p, { boat: b, spi: false }])} />
        </div>
      )}

      {/* Uitleg */}
      <UitlegBlok />
      <div className="pb-4" />
    </div>
  )
}

function UitlegBlok() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <p className="section-title">Uitleg</p>
      <div className="card">
        <button onClick={() => setOpen(o => !o)}
          className="row w-full flex items-center justify-between text-left">
          <span className="text-[15px] font-medium" style={{ color: 'var(--text)' }}>
            Hoe werkt Texel Rating?
          </span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ color: 'var(--text3)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {open && <>
          <div className="row">
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
              Texel Rating (TR) is een handicapsysteem zodat boten van verschillende klassen eerlijk samen kunnen racen. Hogere TR = langzamere boot = meer tijd toegestaan.
            </p>
          </div>
          <div className="row" style={{ backgroundColor: 'var(--surface2)' }}>
            <p className="text-[11px] font-semibold tracking-wide uppercase mb-1.5" style={{ color: 'var(--text3)' }}>Formule</p>
            <p className="text-xs font-['DM_Mono']" style={{ color: 'var(--accent)' }}>
              TR = 100 / (1.15 × RL⁰·³ × RSA⁰·⁴ / RW⁰·³²⁵)
            </p>
          </div>
          <div className="row" style={{ backgroundColor: 'var(--surface2)' }}>
            <p className="text-[11px] font-semibold tracking-wide uppercase mb-1.5" style={{ color: 'var(--text3)' }}>Voorbeeld</p>
            <p className="text-sm" style={{ color: 'var(--text2)' }}>Hobie 16 (jij) · TR 113 · 4:00</p>
            <div className="flex justify-between mt-1">
              <span className="text-sm" style={{ color: 'var(--text2)' }}>Hobie 14 · TR 119</span>
              <span className="text-sm font-['DM_Mono'] font-medium" style={{ color: 'var(--green)' }}>max. 4:13 (+13 min)</span>
            </div>
          </div>
        </>}
      </div>
    </div>
  )
}
