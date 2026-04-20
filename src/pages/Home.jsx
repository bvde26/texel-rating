export default function Home() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Welcome to Round Texel 2025</h2>
        <p className="text-gray-700 mb-4">
          The most exciting catamaran race around Texel. Find all the information you need: race schedule,
          handicap system, boat registrations, and live updates.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📅 Schedule & Info</h3>
          <p className="text-gray-600 text-sm">
            View the race schedule, rules, and important information for this year.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">⚙️ Texel Rating</h3>
          <p className="text-gray-600 text-sm">
            Explore the handicap system and compare your boat's rating with others.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">⛵ Registrations</h3>
          <p className="text-gray-600 text-sm">
            Browse all registered boats and their details for this race.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
        <h3 className="font-semibold text-blue-900 mb-2">📢 Quick Links</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Registration opens: June 7, 10:00</li>
          <li>• Skippers meeting: June 7, 15:00</li>
          <li>• Race start: June 8, 10:00</li>
        </ul>
      </div>
    </div>
  )
}
