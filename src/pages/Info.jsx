import { useState } from 'react'
import schedule from '../data/schedule.json'

export default function Info() {
  const [expandedDay, setExpandedDay] = useState(null)

  return (
    <div className="space-y-3">
      <div className="card p-4">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] mb-3" style={{ color: 'var(--text2)' }}>
          PROGRAMMA
        </p>

        <div className="space-y-2">
          {schedule.days.map(day => (
            <div key={day.day} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                className="w-full px-4 py-4 flex items-center justify-between transition-colors"
                style={{ backgroundColor: expandedDay === day.day ? 'var(--surface2)' : 'transparent' }}
              >
                <div className="text-left">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                    Dag {day.day}: {day.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{day.date}</p>
                </div>
                <span
                  className="text-sm ml-2 shrink-0 transition-transform duration-200"
                  style={{
                    color: 'var(--text3)',
                    transform: expandedDay === day.day ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >▾</span>
              </button>

              {expandedDay === day.day && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  {day.events.map((event, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 px-4 py-3"
                      style={{ borderBottom: idx < day.events.length - 1 ? '1px solid var(--border)' : 'none' }}
                    >
                      <span
                        className="font-['DM_Mono'] text-xs font-medium min-w-12 shrink-0 pt-0.5"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        {event.time}
                      </span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{event.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] mb-3" style={{ color: 'var(--text2)' }}>
          REGELS
        </p>
        <ul className="space-y-2">
          {schedule.rules.map((rule, idx) => (
            <li key={idx} className="flex gap-2 text-sm" style={{ color: 'var(--text2)' }}>
              <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>·</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-4">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] mb-3" style={{ color: 'var(--text2)' }}>
          CONTACT
        </p>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text3)' }}>Organisatie</p>
            <p style={{ color: 'var(--text)' }}>{schedule.contact.organizerName}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text3)' }}>E-mail</p>
            <a
              href={`mailto:${schedule.contact.organizerEmail}`}
              className="hover:underline"
              style={{ color: 'var(--accent-text)' }}
            >
              {schedule.contact.organizerEmail}
            </a>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text3)' }}>Telefoon</p>
            <p className="font-['DM_Mono']" style={{ color: 'var(--text)' }}>{schedule.contact.organizerPhone}</p>
          </div>
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'var(--text3)' }}>Website</p>
            <a
              href={`https://${schedule.contact.website}`}
              className="hover:underline"
              style={{ color: 'var(--accent-text)' }}
            >
              {schedule.contact.website}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
