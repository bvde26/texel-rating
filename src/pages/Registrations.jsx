import { useState, useMemo } from 'react'
import registrations from '../data/registrations.json'

export default function Registrations() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')

  const classes = useMemo(() => {
    return ['all', ...new Set(registrations.boats.map(b => b.class))].sort()
  }, [])

  const filtered = useMemo(() => {
    return registrations.boats.filter(boat => {
      const matchesSearch =
        boat.boatName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boat.skipper.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boat.sailNumber.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesClass = filterClass === 'all' || boat.class === filterClass

      return matchesSearch && matchesClass
    })
  }, [searchTerm, filterClass])

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Registered Boats</h2>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search boat name, skipper..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Class</label>
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {classes.map(cls => (
                <option key={cls} value={cls}>
                  {cls === 'all' ? 'All Classes' : cls}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterClass('all')
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
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-900">Boat Name</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-900">Skipper</th>
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-blue-900">Class</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-900">Sail #</th>
                <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-blue-900">Rating</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(boat => (
                <tr key={boat.id} className="hover:bg-blue-50 transition">
                  <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">{boat.boatName}</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">{boat.skipper}</td>
                  <td className="border border-gray-300 px-4 py-3 text-gray-700">{boat.class}</td>
                  <td className="border border-gray-300 px-4 py-3 text-center text-gray-700 font-mono">
                    {boat.sailNumber}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-bold text-blue-900">
                    {boat.texelRating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          Showing {filtered.length} of {registrations.boats.length} boats
        </div>

        {filtered.length === 0 && (
          <div className="mt-6 text-center text-gray-600">
            No boats found matching your filters.
          </div>
        )}
      </div>
    </div>
  )
}
