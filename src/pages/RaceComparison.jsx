import { useState, useMemo, useRef, useEffect } from 'react'
import boats from '../data/boats.json'

function SpiToggle({ value, onChange }) {
  return (
    <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid var(--border2)' }}>
      <button
        onClick={() => onChange(false)}
        className="flex-1 py-3 px-3 text-xs font-semibold transition-colors"
        style={{
          backgroundColor: !value ? 'var(--accent)' : 'var(--surface2)',
          color: !value ? '#fff' : 'var(--text2)',
        }}
      >
        Geen spi
      </button>
      <button
        onClick={() => onChange(true)}
        className="flex-1 py-3 px-3 text-xs font-semibold transition-colors"
        style={{
          backgroundColor: value ? 'var(--accent)' : 'var(--surface2)',
          color: value ? '#fff' : 'var(--text2)',
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
        className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
        style={{
          backgroundColor: 'var(--surface2)',
          border: '1px solid var(--border2)',
          color: 'var(--text)',
        }}
      />
      {open && (
        <div
          className="absolute z-10 w-full rounded-xl shadow-xl mt-1 max-h-64 overflow-y-auto"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border2)',
          }}
        >
          {filtered.length === 0 && (
            <p className="px-4 py-3 text-sm" style={{ color: 'var(--text3)' }}>Geen boten gevonden</p>
          )}
          {filtered.map(boat => (
            <button
              key={boat.id}
              onMouseDown={() => { onSelect(boat); setSearch(''); setOpen(false) }}
              className="w-full text-left px-4 py-3.5 transition-colors"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{boat.type}</span>
              <span className="text-xs font-['DM_Mono'] ml-2" style={{ color: 'var(--text2)' }}>
                TR {boat.trNoSpi}{boat.trWithSpi ? `/${boat.trWithSpi}` : ''}
              </span>
              <span className="text-xs ml-1" style={{ color: 'var(--text3)' }}>· {boat.class}</span>
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
    if (h > 0) return `${h}U ${m}M`
    return `${m} MIN`
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
    <div className="space-y-3">
      {/* Own boat */}
      <div className="card p-4">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] mb-3" style={{ color: 'var(--text2)' }}>
          TIJDVERGELIJKER
        </p>

        {!selectedBoat ? (
          <div>
            <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>Selecteer je eigen boot:</p>
            <BoatPicker placeholder="Zoek je boot..." excludeIds={[]} onSelect={setSelectedBoat} />
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className="rounded-xl p-3"
              style={{
                backgroundColor: 'var(--surface2)',
                borderLeft: '3px solid var(--accent)',
                border: '1px solid var(--border2)',
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--text)' }}>
                    {selectedBoat.type}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                    {selectedBoat.class}
                    <span className="mx-1.5" style={{ color: 'var(--text3)' }}>·</span>
                    TR{' '}
                    <span className="font-['DM_Mono'] font-medium" style={{ color: 'var(--accent-text)' }}>
                      {ownTR}
                    </span>
                    {selectedBoat.trWithSpi && (
                      <span className="ml-1 font-['DM_Mono']" style={{ color: 'var(--text3)' }}>
                        ({selectedBoat.trNoSpi}/{selectedBoat.trWithSpi})
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedBoat(null); setComparisonBoats([]) }}
                  className="text-xs px-3 py-1.5 rounded-full ml-3 shrink-0 font-semibold transition-opacity hover:opacity-80"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                >
                  Wijzig
                </button>
              </div>

              <SpiToggle value={ownSpi} onChange={setOwnSpi} />

              <div className="flex items-center gap-3 mt-3">
                <label className="text-xs font-semibold shrink-0" style={{ color: 'var(--text2)' }}>
                  Racetijd
                </label>
                <input
                  type="time"
                  value={finishTime}
                  onChange={e => setFinishTime(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-['DM_Mono'] focus:outline-none"
                  style={{
                    backgroundColor: 'var(--surface)',
                    border: '1px solid var(--border2)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison cards */}
      {selectedBoat && (
        <>
          {results.map(({ boat, spi, compTR, allowedSeconds, diff }) => (
            <div
              key={boat.id}
              className="card p-4"
              style={{
                borderLeft: `4px solid ${diff >= 0 ? 'var(--green)' : 'var(--red)'}`,
                backgroundColor: diff >= 0 ? 'var(--green-light)' : 'var(--red-light)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{boat.type}</span>
                  <span className="text-xs font-['DM_Mono'] ml-2" style={{ color: 'var(--text2)' }}>
                    TR {compTR}
                  </span>
                </div>
                <button
                  onClick={() => removeBoat(boat.id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl leading-none transition-colors shrink-0 ml-2"
                  style={{ backgroundColor: 'var(--surface)', color: 'var(--text3)' }}
                >
                  ×
                </button>
              </div>

              <div className="mb-3">
                <SpiToggle value={spi} onChange={() => toggleSpi(boat.id)} />
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text3)' }}>
                    Max. tijd
                  </p>
                  <p
                    className="text-xl font-['DM_Mono'] font-medium leading-none"
                    style={{ color: diff >= 0 ? 'var(--green)' : 'var(--red)' }}
                  >
                    {formatTime(allowedSeconds)}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-['Bebas_Neue'] text-5xl leading-none tracking-wide"
                    style={{ color: diff >= 0 ? 'var(--green)' : 'var(--red)' }}
                  >
                    {diff >= 0 ? '+' : '−'}{formatDiff(diff)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                    {diff >= 0 ? 'mag langer doen' : 'eerder finishen'}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Add boat */}
          <div className="card p-4">
            <p className="text-xs mb-2" style={{ color: 'var(--text3)' }}>
              {comparisonBoats.length === 0 ? 'Voeg een boot toe om te vergelijken:' : 'Nog een boot toevoegen:'}
            </p>
            <BoatPicker placeholder="Zoek boot..." excludeIds={excludeIds} onSelect={addBoat} />
          </div>
        </>
      )}

      {results.length > 0 && (
        <p className="text-[10px] text-center font-['DM_Mono'] pb-1" style={{ color: 'var(--text3)' }}>
          max.tijd = jouw tijd × (TR concurrent ÷ TR jouw boot)
        </p>
      )}

      <UitlegBlok />
    </div>
  )
}

function UitlegBlok() {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-4 flex items-center justify-between transition-colors"
        style={{ backgroundColor: open ? 'var(--surface2)' : 'transparent' }}
      >
        <span className="text-xs font-['Bebas_Neue'] tracking-[0.15em]" style={{ color: 'var(--text2)' }}>
          HOE WERKT TEXEL RATING?
        </span>
        <span
          className="text-sm transition-transform duration-200"
          style={{ color: 'var(--text3)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >▾</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
            Texel Rating (TR) is een handicapsysteem zodat boten van verschillende klassen eerlijk samen kunnen racen. Hogere TR = langzamere boot = meer tijd toegestaan.
          </p>

          <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border2)' }}>
            <p className="text-[10px] mb-1 uppercase tracking-wide" style={{ color: 'var(--text3)' }}>Formule</p>
            <p className="font-['DM_Mono'] text-xs" style={{ color: 'var(--accent-text)' }}>
              TR = 100 / (1.15 × RL⁰·³ × RSA⁰·⁴ / RW⁰·³²⁵)
            </p>
          </div>

          <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: 'var(--surface2)', border: '1px solid var(--border2)' }}>
            <p className="text-[10px] mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text3)' }}>Voorbeeld</p>
            <div className="space-y-1 text-xs">
              <p style={{ color: 'var(--text2)' }}>Hobie 16 (jij) · TR 113 · 4:00</p>
              <div className="flex justify-between">
                <span style={{ color: 'var(--text2)' }}>Hobie 14 · TR 119</span>
                <span className="font-['DM_Mono']" style={{ color: 'var(--green)' }}>max. 4:13 (+13 min)</span>
              </div>
              <p className="text-[10px] pt-0.5 font-['DM_Mono']" style={{ color: 'var(--text3)' }}>
                4:00 × (119 ÷ 113) = 4:13
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]" style={{ color: 'var(--text2)' }}>
            <div><span style={{ color: 'var(--text3)' }}>RL</span> · Ratinglengte (m)</div>
            <div><span style={{ color: 'var(--text3)' }}>RSA</span> · Zeiloppervlak (m²)</div>
            <div><span style={{ color: 'var(--text3)' }}>RW</span> · Gewicht incl. crew (kg)</div>
            <div><span style={{ color: 'var(--text3)' }}>Spi</span> · +1% op TR</div>
          </div>
        </div>
      )}
    </div>
  )
}
