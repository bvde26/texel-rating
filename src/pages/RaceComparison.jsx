import { useState, useMemo, useRef, useEffect } from 'react'
import boats from '../data/boats.json'

function SpiToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
      <button
        onClick={() => onChange(false)}
        className={`flex-1 py-1.5 px-3 transition-colors ${!value ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
      >
        Geen spi
      </button>
      <button
        onClick={() => onChange(true)}
        className={`flex-1 py-1.5 px-3 transition-colors ${value ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
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
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-gray-50"
      />
      {open && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">Geen boten gevonden</p>
          )}
          {filtered.map(boat => (
            <button
              key={boat.id}
              onMouseDown={() => { onSelect(boat); setSearch(''); setOpen(false) }}
              className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-gray-50 last:border-0"
            >
              <span className="font-semibold text-sm text-gray-900">{boat.type}</span>
              <span className="text-xs text-gray-400 ml-2">
                TR {boat.trNoSpi}{boat.trWithSpi ? `/${boat.trWithSpi}` : ''} · {boat.class}
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
    <div className="space-y-3">
      {/* Own boat card */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Tijdvergelijker</h2>

        {!selectedBoat ? (
          <div>
            <p className="text-xs text-gray-400 mb-2">Selecteer je eigen boot:</p>
            <BoatPicker placeholder="Zoek je boot..." excludeIds={[]} onSelect={setSelectedBoat} />
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-2.5">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-blue-900 text-sm leading-tight">{selectedBoat.type}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedBoat.class}
                  <span className="mx-1">·</span>
                  TR <span className="font-bold text-blue-700">{ownTR}</span>
                  {selectedBoat.trWithSpi && (
                    <span className="text-gray-400 ml-1">({selectedBoat.trNoSpi}/{selectedBoat.trWithSpi})</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => { setSelectedBoat(null); setComparisonBoats([]) }}
                className="text-xs px-2.5 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ml-3 shrink-0"
              >
                Wijzig
              </button>
            </div>

            <SpiToggle value={ownSpi} onChange={setOwnSpi} />

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-blue-900 shrink-0">Racetijd</label>
              <input
                type="time"
                value={finishTime}
                onChange={e => setFinishTime(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 text-sm"
              />
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
              className={`bg-white rounded-xl shadow-sm border-l-4 p-3 ${diff >= 0 ? 'border-green-500' : 'border-red-400'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-sm text-gray-900">{boat.type}</span>
                  <span className="text-xs text-gray-400 ml-2">TR {compTR}</span>
                </div>
                <button
                  onClick={() => removeBoat(boat.id)}
                  className="text-gray-300 hover:text-gray-500 text-2xl leading-none w-7 h-7 flex items-center justify-center shrink-0"
                >
                  ×
                </button>
              </div>

              <div className="mb-3">
                <SpiToggle value={spi} onChange={() => toggleSpi(boat.id)} />
              </div>

              <div className={`rounded-lg px-3 py-2.5 flex items-center justify-between ${diff >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide">Max. tijd</p>
                  <p className="text-xl font-bold text-gray-800 leading-tight">{formatTime(allowedSeconds)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold leading-none ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {diff >= 0 ? '+' : '−'}{formatDiff(diff)}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {diff >= 0 ? 'mag langer doen' : 'eerder finishen'}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Add boat */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs text-gray-400 mb-2">
              {comparisonBoats.length === 0 ? 'Voeg een boot toe om te vergelijken:' : 'Nog een boot toevoegen:'}
            </p>
            <BoatPicker placeholder="Zoek boot..." excludeIds={excludeIds} onSelect={addBoat} />
          </div>
        </>
      )}

      {results.length > 0 && (
        <p className="text-[11px] text-gray-300 text-center pb-1">
          Max. tijd = jouw tijd × (TR concurrent ÷ TR jouw boot)
        </p>
      )}
    </div>
  )
}
