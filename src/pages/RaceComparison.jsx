import { useState, useMemo, useRef, useEffect } from 'react'
import boats from '../data/boats.json'

function SpiToggle({ value, onChange }) {
  return (
    <div
      className="flex p-0.5 rounded-lg"
      style={{ backgroundColor: 'var(--surface2)' }}
    >
      <button
        onClick={() => onChange(false)}
        className="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all"
        style={{
          backgroundColor: !value ? 'var(--surface)' : 'transparent',
          color: !value ? 'var(--label)' : 'var(--label2)',
          boxShadow: !value ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
        }}
      >
        Geen spi
      </button>
      <button
        onClick={() => onChange(true)}
        className="flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all"
        style={{
          backgroundColor: value ? 'var(--surface)' : 'transparent',
          color: value ? 'var(--label)' : 'var(--label2)',
          boxShadow: value ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
        }}
      >
        Met spi
      </button>
    </div>
  )
}

function BoatPicker({ placeholder, excludeIds = [], onSelect }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() =>
    boats.boats
      .filter(b => !excludeIds.includes(b.id) && b.type.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.type.localeCompare(b.type))
  , [search, excludeIds])

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={e => { setSearch(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        className="w-full px-3 py-3 text-sm focus:outline-none rounded-xl"
        style={{
          backgroundColor: 'var(--surface)',
          color: 'var(--label)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      />
      {open && filtered.length > 0 && (
        <div
          className="absolute z-10 w-full rounded-xl mt-1 overflow-hidden"
          style={{
            backgroundColor: 'var(--surface)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {filtered.map(boat => (
            <button
              key={boat.id}
              onMouseDown={() => { onSelect(boat); setSearch(''); setOpen(false) }}
              className="ios-row w-full text-left flex items-center justify-between"
            >
              <span className="text-sm font-medium" style={{ color: 'var(--label)' }}>{boat.type}</span>
              <span className="text-xs font-['DM_Mono'] ml-2" style={{ color: 'var(--label2)' }}>
                TR {boat.trNoSpi}{boat.trWithSpi ? `/${boat.trWithSpi}` : ''}
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
  const [comparisonBoats, setComparisonBoats] = useState([])

  const finishTimeSeconds = useMemo(() => {
    const [h, m] = finishTime.split(':').map(Number)
    return (h * 60 + m) * 60
  }, [finishTime])

  const ownTR = selectedBoat ? getTR(selectedBoat, ownSpi) : null

  const results = useMemo(() => {
    if (!selectedBoat || !finishTimeSeconds || !ownTR) return []
    return comparisonBoats.map(({ boat, spi }) => {
      const compTR = getTR(boat, spi)
      const allowedSeconds = finishTimeSeconds * (compTR / ownTR)
      const diff = allowedSeconds - finishTimeSeconds
      return { boat, spi, compTR, allowedSeconds, diff }
    })
  }, [selectedBoat, finishTimeSeconds, comparisonBoats, ownTR])

  const formatTime = (seconds) => {
    const totalMin = Math.round(seconds / 60)
    const h = Math.floor(totalMin / 60)
    const m = totalMin % 60
    return `${h}:${String(m).padStart(2, '0')}`
  }

  const formatDiff = (diffSeconds) => {
    const abs = Math.abs(Math.round(diffSeconds / 60))
    const h = Math.floor(abs / 60)
    const m = abs % 60
    if (h > 0) return `${h}u ${m}m`
    return `${m} min`
  }

  const addBoat = (boat) => {
    if (!comparisonBoats.find(b => b.boat.id === boat.id)) {
      setComparisonBoats(prev => [...prev, { boat, spi: false }])
    }
  }

  const removeBoat = (boatId) => setComparisonBoats(prev => prev.filter(b => b.boat.id !== boatId))

  const toggleSpi = (boatId) => {
    setComparisonBoats(prev => prev.map(b => b.boat.id === boatId ? { ...b, spi: !b.spi } : b))
  }

  const excludeIds = [selectedBoat?.id, ...comparisonBoats.map(b => b.boat.id)].filter(Boolean)

  return (
    <div>
      {/* Eigen boot */}
      <p className="ios-section-label">EIGEN BOOT</p>

      {!selectedBoat ? (
        <BoatPicker placeholder="Zoek je boot…" excludeIds={[]} onSelect={setSelectedBoat} />
      ) : (
        <div className="ios-card">
          <div className="ios-row flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--label)' }}>{selectedBoat.type}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--label2)' }}>
                {selectedBoat.class} · TR <span className="font-['DM_Mono']" style={{ color: 'var(--accent)' }}>{ownTR}</span>
              </p>
            </div>
            <button
              onClick={() => { setSelectedBoat(null); setComparisonBoats([]) }}
              className="text-sm px-3 py-1.5 rounded-lg font-medium"
              style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent)' }}
            >
              Wijzig
            </button>
          </div>
          <div className="ios-row">
            <SpiToggle value={ownSpi} onChange={setOwnSpi} />
          </div>
          <div className="ios-row flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--label)' }}>Racetijd</span>
            <input
              type="time"
              value={finishTime}
              onChange={e => setFinishTime(e.target.value)}
              className="text-sm font-['DM_Mono'] focus:outline-none bg-transparent"
              style={{ color: 'var(--accent)' }}
            />
          </div>
        </div>
      )}

      {/* Concurrenten */}
      {selectedBoat && results.map(({ boat, spi, compTR, allowedSeconds, diff }) => (
        <div key={boat.id}>
          <p className="ios-section-label">{boat.type.toUpperCase()}</p>
          <div
            className="ios-card"
            style={{ backgroundColor: diff >= 0 ? 'var(--green-bg)' : 'var(--red-bg)' }}
          >
            <div className="ios-row flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--label)' }}>{boat.type}</p>
                <p className="text-xs mt-0.5 font-['DM_Mono']" style={{ color: 'var(--label2)' }}>TR {compTR}</p>
              </div>
              <button
                onClick={() => removeBoat(boat.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: 'rgba(60,60,67,0.08)', color: 'var(--label2)' }}
              >
                ×
              </button>
            </div>
            <div className="ios-row">
              <SpiToggle value={spi} onChange={() => toggleSpi(boat.id)} />
            </div>
            <div className="ios-row flex items-end justify-between">
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--label2)' }}>Max. tijd</p>
                <p className="text-lg font-['DM_Mono'] font-medium" style={{ color: diff >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {formatTime(allowedSeconds)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-['Bebas_Neue'] text-5xl leading-none" style={{ color: diff >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {diff >= 0 ? '+' : '−'}{formatDiff(diff)}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--label2)' }}>
                  {diff >= 0 ? 'mag langer doen' : 'eerder finishen'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Boot toevoegen */}
      {selectedBoat && (
        <div>
          <p className="ios-section-label">
            {comparisonBoats.length === 0 ? 'CONCURRENT TOEVOEGEN' : 'NOG EEN TOEVOEGEN'}
          </p>
          <BoatPicker placeholder="Zoek boot…" excludeIds={excludeIds} onSelect={addBoat} />
        </div>
      )}

      {/* Uitleg */}
      <UitlegBlok />
    </div>
  )
}

function UitlegBlok() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <p className="ios-section-label">TEXEL RATING UITLEG</p>
      <div className="ios-card">
        <button
          onClick={() => setOpen(o => !o)}
          className="ios-row w-full flex items-center justify-between"
        >
          <span className="text-sm font-medium" style={{ color: 'var(--label)' }}>Hoe werkt Texel Rating?</span>
          <span
            className="text-xs transition-transform duration-200"
            style={{ color: 'var(--label3)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
          >›</span>
        </button>
        {open && (
          <>
            <div className="ios-row">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--label2)' }}>
                Texel Rating (TR) is een handicapsysteem zodat boten van verschillende klassen eerlijk samen kunnen racen. Hogere TR = langzamere boot = meer tijd toegestaan.
              </p>
            </div>
            <div className="ios-row" style={{ backgroundColor: 'var(--surface2)' }}>
              <p className="text-xs mb-1 uppercase tracking-wide" style={{ color: 'var(--label3)' }}>Formule</p>
              <p className="text-xs font-['DM_Mono']" style={{ color: 'var(--accent)' }}>
                TR = 100 / (1.15 × RL⁰·³ × RSA⁰·⁴ / RW⁰·³²⁵)
              </p>
            </div>
            <div className="ios-row" style={{ backgroundColor: 'var(--surface2)' }}>
              <p className="text-xs mb-1.5 uppercase tracking-wide" style={{ color: 'var(--label3)' }}>Voorbeeld</p>
              <p className="text-xs" style={{ color: 'var(--label2)' }}>Hobie 16 (jij) · TR 113 · 4:00</p>
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: 'var(--label2)' }}>Hobie 14 · TR 119</span>
                <span className="text-xs font-['DM_Mono']" style={{ color: 'var(--green)' }}>max. 4:13 (+13 min)</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
