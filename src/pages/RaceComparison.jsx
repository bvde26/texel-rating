import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import boats from '../data/boats.json'

function SpiToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg border border-[var(--border2)] overflow-hidden text-xs font-semibold">
      <button
        onClick={() => onChange(false)}
        className={`flex-1 py-1.5 px-3 transition-colors ${!value ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface2)] text-[var(--text2)] hover:text-[var(--text)]'}`}
      >
        Geen spi
      </button>
      <button
        onClick={() => onChange(true)}
        className={`flex-1 py-1.5 px-3 transition-colors ${value ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface2)] text-[var(--text2)] hover:text-[var(--text)]'}`}
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
        className="w-full px-3 py-2.5 bg-[var(--surface2)] border border-[var(--border2)] rounded-lg text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
      />
      {open && (
        <div className="absolute z-10 w-full bg-[var(--surface2)] border border-[var(--border2)] rounded-xl shadow-2xl mt-1 max-h-60 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-4 py-3 text-sm text-[var(--text3)]">Geen boten gevonden</p>
          )}
          {filtered.map(boat => (
            <button
              key={boat.id}
              onMouseDown={() => { onSelect(boat); setSearch(''); setOpen(false) }}
              className="w-full text-left px-3 py-2.5 hover:bg-[var(--surface)] border-b border-[var(--border)] last:border-0 transition-colors"
            >
              <span className="font-semibold text-sm text-[var(--text)]">{boat.type}</span>
              <span className="text-xs text-[var(--text2)] ml-2 font-['DM_Mono']">
                TR {boat.trNoSpi}{boat.trWithSpi ? `/${boat.trWithSpi}` : ''}
              </span>
              <span className="text-xs text-[var(--text3)] ml-1">· {boat.class}</span>
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
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] text-[var(--text2)] mb-3">TIJDVERGELIJKER</p>

        {!selectedBoat ? (
          <div>
            <p className="text-xs text-[var(--text3)] mb-2">Selecteer je eigen boot:</p>
            <BoatPicker placeholder="Zoek je boot..." excludeIds={[]} onSelect={setSelectedBoat} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-[var(--surface2)] border border-l-2 border-[var(--border2)] border-l-[var(--accent)] rounded-xl p-3">
              <div className="flex items-start justify-between mb-2.5">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[var(--text)] text-sm leading-tight">{selectedBoat.type}</p>
                  <p className="text-xs text-[var(--text2)] mt-0.5">
                    {selectedBoat.class}
                    <span className="mx-1.5 text-[var(--text3)]">·</span>
                    TR <span className="font-['DM_Mono'] font-medium text-[var(--accent)]">{ownTR}</span>
                    {selectedBoat.trWithSpi && (
                      <span className="text-[var(--text3)] ml-1 font-['DM_Mono']">({selectedBoat.trNoSpi}/{selectedBoat.trWithSpi})</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedBoat(null); setComparisonBoats([]) }}
                  className="text-xs px-3 py-1 rounded-full bg-[var(--accent)] text-white hover:opacity-80 ml-3 shrink-0 transition-opacity"
                >
                  Wijzig
                </button>
              </div>

              <SpiToggle value={ownSpi} onChange={setOwnSpi} />

              <div className="flex items-center gap-3 mt-2.5">
                <label className="text-xs font-semibold text-[var(--text2)] shrink-0">Racetijd</label>
                <input
                  type="time"
                  value={finishTime}
                  onChange={e => setFinishTime(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-[var(--bg)] border border-[var(--border2)] rounded-lg text-sm font-['DM_Mono'] text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
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
              className={`bg-[var(--surface)] rounded-xl p-3 border-l-4 border border-[var(--border)] ${diff >= 0 ? 'border-l-[var(--green)]' : 'border-l-[var(--red)]'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-sm text-[var(--text)]">{boat.type}</span>
                  <span className="text-xs font-['DM_Mono'] text-[var(--text2)] ml-2">TR {compTR}</span>
                </div>
                <button
                  onClick={() => removeBoat(boat.id)}
                  className="text-[var(--text3)] hover:text-[var(--text2)] text-2xl leading-none w-7 h-7 flex items-center justify-center transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="mb-3">
                <SpiToggle value={spi} onChange={() => toggleSpi(boat.id)} />
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-[var(--text3)] uppercase tracking-wide mb-0.5">Max. tijd</p>
                  <p className={`text-xl font-['DM_Mono'] font-medium leading-none ${diff >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                    {formatTime(allowedSeconds)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-['Bebas_Neue'] text-4xl leading-none tracking-wide ${diff >= 0 ? 'text-[var(--green)] glow-green' : 'text-[var(--red)] glow-red'}`}>
                    {diff >= 0 ? '+' : '−'}{formatDiff(diff)}
                  </p>
                  <p className="text-xs text-[var(--text2)] mt-0.5">
                    {diff >= 0 ? 'mag langer doen' : 'eerder finishen'}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Add boat */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
            <p className="text-xs text-[var(--text3)] mb-2">
              {comparisonBoats.length === 0 ? 'Voeg een boot toe om te vergelijken:' : 'Nog een boot toevoegen:'}
            </p>
            <BoatPicker placeholder="Zoek boot..." excludeIds={excludeIds} onSelect={addBoat} />
          </div>
        </>
      )}

      {results.length > 0 && (
        <p className="text-[10px] text-[var(--text3)] text-center font-['DM_Mono'] pb-1">
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
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--surface2)] transition-colors"
      >
        <span className="text-xs font-['Bebas_Neue'] tracking-[0.15em] text-[var(--text2)]">
          HOE WERKT TEXEL RATING?
        </span>
        <span className={`text-[var(--text3)] transition-transform duration-200 text-sm ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-[var(--border)] space-y-3">
          <p className="text-xs text-[var(--text2)] leading-relaxed">
            Texel Rating (TR) is een handicapsysteem zodat boten van verschillende klassen eerlijk samen kunnen racen. Hogere TR = langzamere boot = meer tijd toegestaan.
          </p>

          <div className="bg-[var(--bg)] rounded-lg px-3 py-2 border border-[var(--border2)]">
            <p className="text-[10px] text-[var(--text3)] mb-1 uppercase tracking-wide">Formule</p>
            <p className="font-['DM_Mono'] text-xs text-[var(--accent)]">TR = 100 / (1.15 × RL⁰·³ × RSA⁰·⁴ / RW⁰·³²⁵)</p>
          </div>

          <div className="bg-[var(--bg)] rounded-lg px-3 py-2 border border-[var(--border2)]">
            <p className="text-[10px] text-[var(--text3)] mb-1.5 uppercase tracking-wide">Voorbeeld</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text2)]">Hobie 16 (jij) · TR 113 · 4:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text2)]">Hobie 14 · TR 119</span>
                <span className="font-['DM_Mono'] text-[var(--green)]">max. 4:13 (+13 min)</span>
              </div>
              <p className="text-[10px] text-[var(--text3)] pt-0.5 font-['DM_Mono']">4:00 × (119 ÷ 113) = 4:13</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-[var(--text2)]">
            <div><span className="text-[var(--text3)]">RL</span> · Ratinglengte (m)</div>
            <div><span className="text-[var(--text3)]">RSA</span> · Zeiloppervlak (m²)</div>
            <div><span className="text-[var(--text3)]">RW</span> · Gewicht incl. crew (kg)</div>
            <div><span className="text-[var(--text3)]">Spi</span> · +1% op TR</div>
          </div>
        </div>
      )}
    </div>
  )
}
