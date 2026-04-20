import { useState } from 'react'
import schedule from '../data/schedule.json'

export default function Info() {
  const [expandedDay, setExpandedDay] = useState(null)

  return (
    <div>
      <p className="ios-section-label">PROGRAMMA</p>
      <div className="ios-card">
        {schedule.days.map(day => (
          <div key={day.day}>
            <button
              onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              className="ios-row w-full flex items-center justify-between text-left"
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>
                  Dag {day.day}: {day.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--label2)' }}>{day.date}</p>
              </div>
              <span
                className="text-xs ml-2 shrink-0 transition-transform duration-200"
                style={{ color: 'var(--label3)', transform: expandedDay === day.day ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >›</span>
            </button>
            {expandedDay === day.day && day.events.map((event, idx) => (
              <div
                key={idx}
                className="ios-row flex gap-3 pl-8"
                style={{ backgroundColor: 'var(--surface2)' }}
              >
                <span
                  className="font-['DM_Mono'] text-sm font-medium min-w-12 shrink-0"
                  style={{ color: 'var(--accent)' }}
                >
                  {event.time}
                </span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--label)' }}>{event.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--label2)' }}>{event.location}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="ios-section-label">REGELS</p>
      <div className="ios-card">
        {schedule.rules.map((rule, idx) => (
          <div key={idx} className="ios-row flex gap-3">
            <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>·</span>
            <p className="text-sm" style={{ color: 'var(--label2)' }}>{rule}</p>
          </div>
        ))}
      </div>

      <p className="ios-section-label">CONTACT</p>
      <div className="ios-card">
        <div className="ios-row flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--label2)' }}>Organisatie</span>
          <span className="text-sm font-medium" style={{ color: 'var(--label)' }}>{schedule.contact.organizerName}</span>
        </div>
        <div className="ios-row flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--label2)' }}>E-mail</span>
          <a
            href={`mailto:${schedule.contact.organizerEmail}`}
            className="text-sm"
            style={{ color: 'var(--accent)' }}
          >
            {schedule.contact.organizerEmail}
          </a>
        </div>
        <div className="ios-row flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--label2)' }}>Telefoon</span>
          <span className="text-sm font-['DM_Mono']" style={{ color: 'var(--label)' }}>{schedule.contact.organizerPhone}</span>
        </div>
        <div className="ios-row flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--label2)' }}>Website</span>
          <a
            href={`https://${schedule.contact.website}`}
            className="text-sm"
            style={{ color: 'var(--accent)' }}
          >
            {schedule.contact.website}
          </a>
        </div>
      </div>
    </div>
  )
}
