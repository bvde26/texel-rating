import { useState, useMemo } from 'react'
import boats from '../data/boats.json'

export default function RaceComparison() {
  const [selectedBoat, setSelectedBoat] = useState(null)
  const [finishTime, setFinishTime] = useState('4:00:00')
  const [comparisonBoats, setComparisonBoats] = useState([])
  const [searchOwn, setSearchOwn] = useState('')
  const [searchCompare, setSearchCompare] = useState('')

  // Parse time string to seconds
  const timeToSeconds = (timeStr) => {
    const [h, m, s] = timeStr.split(':').map(Number)
    return h * 3600 + m * 60 + s
  }

  // Convert seconds to time string
  const secondsToTime = (seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Calculate corrected time (simplified: Corrected = Actual × (TR / 1000))
  const calculateCorrectedTime = (actualSeconds, trRating) => {
    return actualSeconds * (trRating / 1000)
  }

  const finishTimeSeconds = useMemo(() => {
    try {
      return timeToSeconds(finishTime)
    } catch {
      return 0
    }
  }, [finishTime])

  const results = useMemo(() => {
    if (!selectedBoat || !finishTimeSeconds) return []

    const yourCorrected = calculateCorrectedTime(finishTimeSeconds, selectedBoat.trNoSpi)

    return comparisonBoats
      .map(boat => {
        const actualTime = timeToSeconds(boat.time)
        const correctedTime = calculateCorrectedTime(actualTime, boat.boat.trNoSpi)
        const diff = correctedTime - yourCorrected

        return {
          ...boat,
          actualSeconds: actualTime,
          correctedSeconds: correctedTime,
          diff
        }
      })
      .sort((a, b) => a.correctedSeconds - b.correctedSeconds)
  }, [selectedBoat, finishTimeSeconds, comparisonBoats])

  const handleAddComparison = (boat) => {
    if (!finishTime) {
      alert('Please enter your finish time first')
      return
    }

    if (comparisonBoats.some(cb => cb.boat.id === boat.id)) {
      alert('This boat is already added')
      return
    }

    setComparisonBoats([...comparisonBoats, { boat, time: '4:05:00' }])
  }

  const handleRemoveComparison = (boatId) => {
    setComparisonBoats(comparisonBoats.filter(cb => cb.boat.id !== boatId))
  }

  const handleUpdateComparisonTime = (boatId, newTime) => {
    setComparisonBoats(
      comparisonBoats.map(cb =>
        cb.boat.id === boatId ? { ...cb, time: newTime } : cb
      )
    )
  }

  return (
    <div className="space-y-4">
      {/* Your Boat Setup */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Race Time Comparison</h2>

        {!selectedBoat ? (
          <div>
            <p className="text-gray-600 mb-3">Select your boat first:</p>
            <input
              type="text"
              placeholder="Zoek boot..."
              value={searchOwn}
              onChange={e => setSearchOwn(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {boats.boats.filter(b => b.type.toLowerCase().includes(searchOwn.toLowerCase())).map(boat => (
                <button
                  key={boat.id}
                  onClick={() => setSelectedBoat(boat)}
                  className="text-left px-4 py-2 border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-500 transition"
                >
                  <div className="font-semibold text-blue-900">{boat.type}</div>
                  <div className="text-sm text-gray-600">TR {boat.trNoSpi} • {boat.class}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-500">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-blue-900">{selectedBoat.type}</h3>
                  <p className="text-sm text-gray-600">{selectedBoat.class}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBoat(null)
                    setComparisonBoats([])
                  }}
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-blue-900 mb-2">
                  Your Finish Time
                </label>
                <input
                  type="time"
                  value={finishTime}
                  onChange={e => setFinishTime(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                <p className="text-xs text-gray-600">TR Rating (no spi)</p>
                <p className="text-2xl font-bold text-blue-600">{selectedBoat.trNoSpi}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Comparison Boats */}
      {selectedBoat && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">Compare With Other Boats</h3>

          <input
            type="text"
            placeholder="Zoek boot..."
            value={searchCompare}
            onChange={e => setSearchCompare(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
            {boats.boats
              .filter(b => b.id !== selectedBoat.id && b.type.toLowerCase().includes(searchCompare.toLowerCase()))
              .map(boat => (
                <button
                  key={boat.id}
                  onClick={() => handleAddComparison(boat)}
                  disabled={comparisonBoats.some(cb => cb.boat.id === boat.id)}
                  className="w-full text-left px-4 py-2 border border-gray-300 rounded hover:bg-green-50 hover:border-green-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-semibold text-gray-900">{boat.type}</div>
                  <div className="text-sm text-gray-600">TR {boat.trNoSpi}</div>
                </button>
              ))}
          </div>

          <p className="text-xs text-gray-500 text-center">
            {comparisonBoats.length} boat{comparisonBoats.length !== 1 ? 's' : ''} added for comparison
          </p>
        </div>
      )}

      {/* Comparison Times */}
      {comparisonBoats.length > 0 && selectedBoat && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Results</h3>

          <div className="space-y-2">
            {/* Your Result */}
            <div className="bg-green-50 border-2 border-green-500 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-green-900">{selectedBoat.type}</p>
                  <p className="text-sm text-green-700">Your Boat</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Actual: {finishTime}</p>
                  <p className="text-lg font-bold text-green-700">
                    {secondsToTime(Math.round(finishTimeSeconds))}
                  </p>
                </div>
              </div>
            </div>

            {/* Comparison Results */}
            {results.map((result, idx) => (
              <div
                key={result.boat.id}
                className={`p-4 rounded-lg border-l-4 ${
                  result.diff < 0
                    ? 'border-l-green-500 bg-green-50'
                    : 'border-l-red-500 bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{idx + 1}. {result.boat.type}</p>
                    <p className="text-sm text-gray-600">{result.boat.class}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveComparison(result.boat.id)}
                    className="text-xs px-2 py-1 bg-gray-300 hover:bg-gray-400 rounded"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Actual Time</p>
                    <input
                      type="time"
                      value={result.time}
                      onChange={e => handleUpdateComparisonTime(result.boat.id, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Corrected Time</p>
                    <p className="font-semibold text-gray-900">{secondsToTime(Math.round(result.correctedSeconds))}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-bold text-lg ${result.diff < 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {result.diff < 0 ? '✓ ' : '✗ '}
                    {Math.abs(Math.round(result.diff))}s
                  </p>
                  <p className="text-xs text-gray-600">
                    {result.diff < 0 ? 'Faster than you' : 'Slower than you'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Corrected Time = Actual Time × (TR ÷ 1000)
          </p>
        </div>
      )}
    </div>
  )
}
