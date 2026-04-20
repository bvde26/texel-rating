import { useState } from 'react'
import schedule from '../data/schedule.json'

export default function Info() {
  const [expandedDay, setExpandedDay] = useState(null)

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Programma</h2>

        <div className="space-y-1.5">
          {schedule.days.map(day => (
            <div key={day.day} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                className="w-full px-4 py-3 flex items-center justify-between"
              >
                <div className="text-left">
                  <p className="font-semibold text-sm text-gray-900">Dag {day.day}: {day.title}</p>
                  <p className="text-xs text-gray-400">{day.date}</p>
                </div>
                <span className={`text-gray-400 text-xl leading-none transition-transform ${expandedDay === day.day ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {expandedDay === day.day && (
                <div className="border-t border-gray-100">
                  {day.events.map((event, idx) => (
                    <div key={idx} className="flex gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                      <span className="font-mono text-xs font-semibold text-blue-700 min-w-12 shrink-0 pt-0.5">{event.time}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                        <p className="text-xs text-gray-400">{event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Regels</h2>
        <ul className="space-y-2">
          {schedule.rules.map((rule, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-gray-700">
              <span className="text-blue-400 shrink-0 mt-0.5">·</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-3">Contact</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p><span className="font-semibold text-gray-500 text-xs">Organisatie</span><br />{schedule.contact.organizerName}</p>
          <p>
            <span className="font-semibold text-gray-500 text-xs">E-mail</span><br />
            <a href={`mailto:${schedule.contact.organizerEmail}`} className="text-blue-600 hover:underline">
              {schedule.contact.organizerEmail}
            </a>
          </p>
          <p><span className="font-semibold text-gray-500 text-xs">Telefoon</span><br />{schedule.contact.organizerPhone}</p>
          <p>
            <span className="font-semibold text-gray-500 text-xs">Website</span><br />
            <a href={`https://${schedule.contact.website}`} className="text-blue-600 hover:underline">
              {schedule.contact.website}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
