import { useState, useMemo } from 'react'
import boats from '../data/boats.json'

export default function BoatCatalog() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [selectedBoat, setSelectedBoat] = useState(null)
  const [sortBy, setSortBy] = useState('name')

  const filtered = useMemo(() => {
    let results = boats.boats.filter(boat => {
      const matchesSearch =
        boat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boat.class.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClass = filterClass === 'all' || boat.class === filterClass
      return matchesSearch && matchesClass
    })

    if (sortBy === 'tr') results.sort((a, b) => a.trNoSpi - b.trNoSpi)
    else if (sortBy === 'name') results.sort((a, b) => a.type.localeCompare(b.type))
    else if (sortBy === 'crew') results.sort((a, b) => a.crew - b.crew)

    return results
  }, [searchTerm, filterClass, sortBy])

  const classes = useMemo(() => {
    return ['all', ...new Set(boats.boats.map(b => b.class))].sort()
  }, [])

  const reset = () => { setSearchTerm(''); setFilterClass('all'); setSortBy('name'); setSelectedBoat(null) }

  return (
    <div className="space-y-2">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Boten</h2>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Zoek op naam of klasse..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
          />

          <div className="flex gap-2">
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls === 'all' ? 'Alle klassen' : cls}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="flex-1 px-2.5 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="name">Naam ↑</option>
              <option value="tr">TR ↑</option>
              <option value="crew">Crew ↑</option>
            </select>

            <button
              onClick={reset}
              title="Reset filters"
              className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm"
            >
              ↺
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2.5">{filtered.length} van {boats.boats.length} boten</p>
      </div>

      {/* Boat list */}
      <div className="space-y-1.5">
        {filtered.map(boat => {
          const isOpen = selectedBoat?.id === boat.id
          return (
            <div
              key={boat.id}
              className={`bg-white rounded-xl border transition-colors cursor-pointer ${
                isOpen ? 'border-blue-300 shadow-sm' : 'border-gray-100 shadow-sm'
              }`}
              onClick={() => setSelectedBoat(isOpen ? null : boat)}
            >
              <div className="flex items-center p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{boat.type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{boat.class} · {boat.crew} pers</p>
                </div>
                <div className="text-right ml-3 shrink-0 flex items-center gap-2">
                  <div>
                    <p className="text-lg font-bold text-blue-600 leading-none">{boat.trNoSpi}</p>
                    <p className="text-[10px] text-gray-400 text-center">TR</p>
                  </div>
                  <span className={`text-gray-300 text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </div>

              {isOpen && (
                <div className="px-3 pb-3 pt-0 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-gray-400">Klasse</p>
                      <p className="text-sm font-semibold text-gray-800">{boat.class}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-gray-400">Bemanning</p>
                      <p className="text-sm font-semibold text-gray-800">{boat.crew} pers</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-gray-400">TR geen spi</p>
                      <p className="text-base font-bold text-green-700">{boat.trNoSpi}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-2.5">
                      <p className="text-[10px] text-gray-400">TR met spi</p>
                      <p className="text-base font-bold text-orange-600">{boat.trWithSpi ?? '—'}</p>
                    </div>
                    {boat.rl && (
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-400">Ratinglengte</p>
                        <p className="text-sm font-semibold text-gray-800">{boat.rl} m</p>
                      </div>
                    )}
                    {boat.rsa && (
                      <div className="bg-gray-50 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-400">Zeiloppervlak</p>
                        <p className="text-sm font-semibold text-gray-800">{boat.rsa} m²</p>
                      </div>
                    )}
                    {boat.rw && (
                      <div className="bg-gray-50 rounded-lg p-2.5 col-span-2">
                        <p className="text-[10px] text-gray-400">Gewicht (incl. crew)</p>
                        <p className="text-sm font-semibold text-gray-800">{boat.rw} kg</p>
                      </div>
                    )}
                  </div>
                  {boat.notes && (
                    <p className="mt-2 text-xs text-gray-500 italic">{boat.notes}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm bg-white rounded-xl">
            Geen boten gevonden
          </div>
        )}
      </div>
    </div>
  )
}
