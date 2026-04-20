import { useState, useMemo } from 'react'
import boats from '../data/boats.json'

export default function BoatCatalog() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [selectedBoat, setSelectedBoat] = useState(null)
  const [sortBy, setSortBy] = useState('name')

  const filtered = useMemo(() => {
    let results = boats.boats.filter(boat => {
      const matchesSearch = boat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           boat.class.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClass = filterClass === 'all' || boat.class === filterClass
      return matchesSearch && matchesClass
    })

    // Sort
    if (sortBy === 'tr') {
      results.sort((a, b) => a.trNoSpi - b.trNoSpi)
    } else if (sortBy === 'name') {
      results.sort((a, b) => a.type.localeCompare(b.type))
    } else if (sortBy === 'crew') {
      results.sort((a, b) => a.crew - b.crew)
    }

    return results
  }, [searchTerm, filterClass, sortBy])

  const classes = useMemo(() => {
    return ['all', ...new Set(boats.boats.map(b => b.class))].sort()
  }, [])

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Boat Catalog</h2>

        {/* Search & Filters */}
        <div className="space-y-3 mb-6">
          <input
            type="text"
            placeholder="Search boat type or class..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {classes.map(cls => (
                <option key={cls} value={cls}>
                  {cls === 'all' ? 'All Classes' : cls}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="tr">Sort by TR</option>
              <option value="name">Sort by Name</option>
              <option value="crew">Sort by Crew</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('')
              setFilterClass('all')
              setSortBy('tr')
              setSelectedBoat(null)
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Reset Filters
          </button>
        </div>

        {/* Boat List */}
        <div className="space-y-3">
          {filtered.map(boat => (
            <div
              key={boat.id}
              className="border border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
              onClick={() => setSelectedBoat(selectedBoat?.id === boat.id ? null : boat)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-blue-900">{boat.type}</h3>
                  <p className="text-sm text-gray-600">{boat.class} • {boat.crew} crew</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{boat.trNoSpi}</div>
                  <p className="text-xs text-gray-500">TR (no spi)</p>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-gray-600 py-8">
              No boats found matching your search
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Showing {filtered.length} of {boats.boats.length} boats
        </p>
      </div>

      {/* Boat Details */}
      {selectedBoat && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4">{selectedBoat.type} — Specifications</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <p className="text-xs text-gray-600">Class</p>
              <p className="font-semibold text-blue-900">{selectedBoat.class}</p>
            </div>

            <div className="bg-blue-50 p-4 rounded">
              <p className="text-xs text-gray-600">Crew</p>
              <p className="font-semibold text-blue-900">{selectedBoat.crew} person{selectedBoat.crew > 1 ? 's' : ''}</p>
            </div>

            <div className="bg-green-50 p-4 rounded">
              <p className="text-xs text-gray-600">TR (No Spinnaker)</p>
              <p className="font-bold text-green-700 text-xl">{selectedBoat.trNoSpi}</p>
            </div>

            <div className="bg-orange-50 p-4 rounded">
              <p className="text-xs text-gray-600">TR (With Spinnaker)</p>
              <p className="font-bold text-orange-700 text-xl">{selectedBoat.trWithSpi}</p>
            </div>

            <div className="bg-gray-100 p-4 rounded col-span-2">
              <p className="text-xs text-gray-600">Rated Length</p>
              <p className="font-semibold text-gray-900">{selectedBoat.rl} m</p>
            </div>

            <div className="bg-gray-100 p-4 rounded col-span-2">
              <p className="text-xs text-gray-600">Rated Sail Area</p>
              <p className="font-semibold text-gray-900">{selectedBoat.rsa} m²</p>
            </div>

            <div className="bg-gray-100 p-4 rounded col-span-2">
              <p className="text-xs text-gray-600">Rated Weight</p>
              <p className="font-semibold text-gray-900">{selectedBoat.rw} kg</p>
            </div>
          </div>

          {selectedBoat.notes && (
            <p className="mt-4 text-sm text-gray-700 italic">
              <strong>Note:</strong> {selectedBoat.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
