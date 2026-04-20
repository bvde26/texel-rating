import { useState } from 'react'
import schedule from '../data/schedule.json'

export default function Info() {
  const [expanded, setExpanded] = useState(null)

  const chevron = (isOpen) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ color: 'var(--text3)', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )

  return (
    <div>
      <p className="section-title">Programma</p>
      <div className="card">
        {schedule.days.map(day => (
          <div key={day.day}>
            <button
              onClick={() => setExpanded(expanded === day.day ? null : day.day)}
              className="row w-full flex items-center justify-between text-left">
              <div>
                <p className="text-[15px] font-medium" style={{ color: 'var(--text)' }}>
                  Dag {day.day}: {day.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{day.date}</p>
              </div>
              {chevron(expanded === day.day)}
            </button>
            {expanded === day.day && day.events.map((ev, i) => (
              <div key={i} className="row flex gap-3 pl-5"
                style={{ backgroundColor: 'var(--surface2)' }}>
                <span className="font-['DM_Mono'] text-sm font-medium w-11 shrink-0 pt-0.5"
                  style={{ color: 'var(--accent)' }}>{ev.time}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{ev.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{ev.location}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <p className="section-title">Regels</p>
      <div className="card">
        {schedule.rules.map((rule, i) => (
          <div key={i} className="row flex gap-2.5">
            <span className="shrink-0 mt-0.5 text-sm" style={{ color: 'var(--accent)' }}>·</span>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{rule}</p>
          </div>
        ))}
      </div>

      <p className="section-title">Contact</p>
      <div className="card">
        {[
          { label: 'Organisatie', value: schedule.contact.organizerName },
          { label: 'E-mail', value: schedule.contact.organizerEmail, href: `mailto:${schedule.contact.organizerEmail}` },
          { label: 'Telefoon', value: schedule.contact.organizerPhone, mono: true },
          { label: 'Website', value: schedule.contact.website, href: `https://${schedule.contact.website}` },
        ].map(({ label, value, href, mono }) => (
          <div key={label} className="row flex items-center justify-between gap-4">
            <span className="text-sm shrink-0" style={{ color: 'var(--text2)' }}>{label}</span>
            {href
              ? <a href={href} className={`text-sm font-medium text-right ${mono ? "font-['DM_Mono']" : ''}`}
                  style={{ color: 'var(--accent)' }}>{value}</a>
              : <span className={`text-sm font-medium text-right ${mono ? "font-['DM_Mono']" : ''}`}
                  style={{ color: 'var(--text)' }}>{value}</span>
            }
          </div>
        ))}
      </div>
      <div className="pb-4" />
    </div>
  )
}
