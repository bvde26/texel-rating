import { useState, useMemo, useRef, useEffect } from 'react'
import boats from '../data/boats.json'

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
      .filter(b =>
        !excludeIds.includes(b.id) &&
        b.type.toLowerCase().includes(search.toLowerCase())
      )
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
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {open && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-56 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-500">Geen boten gevonden</p>
          )}
          {filtered.map(boat => (
            <button
              key={boat.id}
              onMouseDown={() => { onSelect(boat); setSearch(''); setOpen(false) }}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 border-b border-gray-100 last:border-0"
            >
              <span className="font-semibold text-blue-900 text-sm">{boat.type}</span>
              <span className="text-xs text-gray-500 ml-2">TR {boat.trNoSpi} · {boat.class}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RaceComparison() {
  const [selectedBoat, setSelectedBoat] = useState(null)
  const [finishTime, setFinishTime] = useState('04:00')
  const [comparisonBoats, setComparisonBoats] = useState([])

  const finishTimeSeconds = useMemo(() => {
    const [h, m] = finishTime.split(':').map(Number)
    return (h * 60 + m) * 60
  }, [finishTime])

  // For each comparison boat: max actual time to tie on corrected time
  // Allowed = your_time × (TR_competitor / TR_you)
  // Higher TR competitor → may take longer ✓
  const results = useMemo(() => {
    if (!selectedBoat || !finishTimeSeconds) return []
    return comparisonBoats.map(boat => {
      const allowedSeconds = finishTimeSeconds * (boat.trNoSpi / selectedBoat.trNoSpi)
      const diff = allowedSeconds - finishTimeSeconds
      return { boat, allowedSeconds, diff }
    })
  }, [selectedBoat, finishTimeSeconds, comparisonBoats])

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
    if (h > 0) return `${h}u ${m}min`
    return `${m} min`
  }

  const addBoat = (boat) => {
    if (!comparisonBoats.find(b => b.id === boat.id)) {
      setComparisonBoats(prev => [...prev, boat])
    }
  }

  const removeBoat = (boatId) => {
    setComparisonBoats(prev => prev.filter(b => b.id !== boatId))
  }

  const excludeIds = [selectedBoat?.id, ...comparisonBoats.map(b => b.id)].filter(Boolean)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Race Time Comparison</h2>

        {/* Step 1: own boat */}
        {!selectedBoat ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">Selecteer je eigen boot:</p>
            <BoatPicker
              placeholder="Zoek je boot..."
              excludeIds={[]}
              onSelect={setSelectedBoat}
            />
          </div>
        ) : (
          <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-blue-900">{selectedBoat.type}</p>
                <p className="text-xs text-gray-500">{selectedBoat.class} · TR {selectedBoat.trNoSpi}</p>
              </div>
              <button
                onClick={() => { setSelectedBoat(null); setComparisonBoats([]) }}
                className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Wijzig
              </button>
            </div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">Jouw racetijd</label>
            <input
              type="time"
              value={finishTime}
              onChange={e => setFinishTime(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Step 2: comparison boats */}
      {selectedBoat && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-3">
          <h3 className="text-lg font-bold text-blue-900">Vergelijk met andere boten</h3>

          {/* Existing comparison boats */}
          {results.map(({ boat, allowedSeconds, diff }) => (
            <div
              key={boat.id}
              className={`rounded-lg p-4 border-l-4 ${diff >= 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{boat.type}</p>
                  <p className="text-xs text-gray-500">TR {boat.trNoSpi}</p>
                </div>
                <button onClick={() => removeBoat(boat.id)} className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded">
                  ✕
                </button>
              </div>
              <div className="mt-2 flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500">Maximale tijd voor gelijke uitslag</p>
                  <p className="text-xl font-bold text-gray-900">{formatTime(allowedSeconds)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${diff >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {diff >= 0 ? `+${formatDiff(diff)}` : `−${formatDiff(diff)}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {diff >= 0 ? 'mag langer doen' : 'moet eerder finishen'}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Always-visible picker to add next boat */}
          <div>
            <p className="text-sm text-gray-600 mb-2">
              {comparisonBoats.length === 0 ? 'Voeg een boot toe:' : 'Nog een boot toevoegen:'}
            </p>
            <BoatPicker
              placeholder="Zoek boot om toe te voegen..."
              excludeIds={excludeIds}
              onSelect={addBoat}
            />
          </div>
        </div>
      )}

      {results.length > 0 && (
        <p className="text-xs text-gray-400 text-center pb-4">
          Berekening: Toegestane tijd = jouw tijd × (TR concurrent ÷ TR jouw boot). Hogere TR = meer tijd toegestaan.
        </p>
      )}
    </div>
  )
}
