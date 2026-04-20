import { useState } from 'react'
import schedule from '../data/schedule.json'

export default function Info() {
  const [expandedDay, setExpandedDay] = useState(null)

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Race Schedule</h2>

        <div className="space-y-4">
          {schedule.days.map(day => (
            <div
              key={day.day}
              className="border rounded-lg overflow-hidden bg-white"
            >
              <button
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                className="w-full px-6 py-4 bg-blue-50 hover:bg-blue-100 transition flex items-center justify-between"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-blue-900">Day {day.day}: {day.title}</h3>
                  <p className="text-sm text-gray-600">{day.date}</p>
                </div>
                <span className="text-2xl">{expandedDay === day.day ? '−' : '+'}</span>
              </button>

              {expandedDay === day.day && (
                <div className="px-6 py-4 border-t">
                  {day.events.map((event, idx) => (
                    <div key={idx} className="flex gap-4 py-3 border-b last:border-0">
                      <div className="font-mono font-semibold text-blue-900 min-w-16">
                        {event.time}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{event.title}</p>
                        <p className="text-sm text-gray-600">{event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Rules</h2>
        <ul className="space-y-2">
          {schedule.rules.map((rule, idx) => (
            <li key={idx} className="flex gap-3 text-gray-700">
              <span className="font-semibold text-blue-900">•</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Contact</h2>
        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Organizer:</span> {schedule.contact.organizerName}
          </p>
          <p>
            <span className="font-semibold">Email:</span>{' '}
            <a href={`mailto:${schedule.contact.organizerEmail}`} className="text-blue-600 hover:underline">
              {schedule.contact.organizerEmail}
            </a>
          </p>
          <p>
            <span className="font-semibold">Phone:</span> {schedule.contact.organizerPhone}
          </p>
          <p>
            <span className="font-semibold">Website:</span>{' '}
            <a href={`https://${schedule.contact.website}`} className="text-blue-600 hover:underline">
              {schedule.contact.website}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
