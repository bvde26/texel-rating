import { useState } from 'react'
import schedule from '../data/schedule.json'

export default function Info() {
  const [expandedDay, setExpandedDay] = useState(null)

  return (
    <div className="space-y-3">
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] text-[var(--text2)] mb-3">PROGRAMMA</p>

        <div className="space-y-1.5">
          {schedule.days.map(day => (
            <div key={day.day} className="border border-[var(--border)] rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--surface2)] transition-colors"
              >
                <div className="text-left">
                  <p className="font-semibold text-sm text-[var(--text)]">Dag {day.day}: {day.title}</p>
                  <p className="text-xs text-[var(--text2)]">{day.date}</p>
                </div>
                <span className={`text-[var(--text3)] transition-transform duration-200 text-sm ml-2 shrink-0 ${expandedDay === day.day ? 'rotate-180' : ''}`}>▾</span>
              </button>

              {expandedDay === day.day && (
                <div className="border-t border-[var(--border)]">
                  {day.events.map((event, idx) => (
                    <div key={idx} className="flex gap-3 px-4 py-3 border-b border-[var(--border)] last:border-0">
                      <span className="font-['DM_Mono'] text-xs font-medium text-[var(--accent)] min-w-12 shrink-0 pt-0.5">{event.time}</span>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text)]">{event.title}</p>
                        <p className="text-xs text-[var(--text2)]">{event.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] text-[var(--text2)] mb-3">REGELS</p>
        <ul className="space-y-2">
          {schedule.rules.map((rule, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-[var(--text2)]">
              <span className="text-[var(--accent)] shrink-0 mt-0.5">·</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] text-[var(--text2)] mb-3">CONTACT</p>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-[var(--text3)] mb-0.5">Organisatie</p>
            <p className="text-[var(--text)]">{schedule.contact.organizerName}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text3)] mb-0.5">E-mail</p>
            <a href={`mailto:${schedule.contact.organizerEmail}`} className="text-[var(--accent)] hover:underline">
              {schedule.contact.organizerEmail}
            </a>
          </div>
          <div>
            <p className="text-xs text-[var(--text3)] mb-0.5">Telefoon</p>
            <p className="text-[var(--text)] font-['DM_Mono']">{schedule.contact.organizerPhone}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--text3)] mb-0.5">Website</p>
            <a href={`https://${schedule.contact.website}`} className="text-[var(--accent)] hover:underline">
              {schedule.contact.website}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
