import { useState, useMemo } from 'react'

// Sample Texel Rating data (will be replaced with actual ratings)
const SAMPLE_RATINGS = [
  { id: 1, boatType: 'F18', crewCount: 2, rating: 605, class: 'Foiler' },
  { id: 2, boatType: 'Eagle 20', crewCount: 2, rating: 665, class: 'Performance' },
  { id: 3, boatType: 'Tornado', crewCount: 2, rating: 630, class: 'High Performance' },
  { id: 4, boatType: 'Hobie 18', crewCount: 2, rating: 570, class: 'Recreation' },
  { id: 5, boatType: 'Dart 20', crewCount: 2, rating: 591, class: 'Intermediate' },
]

export default function TexelRating() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [selectedBoat, setSelectedBoat] = useState(null)

  const filteredAndSorted = useMemo(() => {
    let results = SAMPLE_RATINGS.filter(boat =>
      boat.boatType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boat.class.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sortBy === 'rating') {
      results.sort((a, b) => a.rating - b.rating)
    } else if (sortBy === 'name') {
      results.sort((a, b) => a.boatType.localeCompare(b.boatType))
    }

    return results
  }, [searchTerm, sortBy])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Texel Rating Handicap System</h2>
        <p className="text-gray-700 mb-6">
          The Texel Rating allows boats of different classes to race together with fair handicap ratings.
          Use the search below to find your boat class and compare handicaps.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search boat type..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="rating">Rating (Low to High)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setSortBy('rating')
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-900">Boat Type</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-900">Class</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-900">Crew</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-900">Rating</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map(boat => (
                <tr key={boat.id} className="hover:bg-blue-50 transition">
                  <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">{boat.boatType}</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">{boat.class}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">{boat.crewCount}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-bold text-blue-900 text-lg">
                    {boat.rating}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedBoat(selectedBoat?.id === boat.id ? null : boat)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                    >
                      {selectedBoat?.id === boat.id ? 'Hide' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSorted.length === 0 && (
          <div className="mt-6 text-center text-gray-600">
            No boats found matching your search.
          </div>
        )}
      </div>

      {selectedBoat && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4">{selectedBoat.boatType} — Details</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Class</p>
              <p className="font-semibold text-gray-900">{selectedBoat.class}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Crew</p>
              <p className="font-semibold text-gray-900">{selectedBoat.crewCount} persons</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Texel Rating</p>
              <p className="font-bold text-blue-900 text-2xl">{selectedBoat.rating}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Note</p>
              <p className="text-gray-700">Lower rating = faster handicap allowance</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
