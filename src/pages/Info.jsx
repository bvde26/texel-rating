import { useState } from 'react'
import schedule from '../data/schedule.json'

function Chevron({ open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{
        color: 'var(--text3)',
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s',
        flexShrink: 0,
      }}
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Info() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="pt-4">
      <p className="section-title">Programma</p>
      <div className="card overflow-hidden">
        {schedule.days.map((day, i) => (
          <div key={day.day} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <button
              onClick={() => setExpanded(expanded === day.day ? null : day.day)}
              className="w-full flex items-center justify-between text-left px-4 py-3.5"
            >
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {day.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{day.date}</p>
              </div>
              <Chevron open={expanded === day.day} />
            </button>

            {expanded === day.day && (
              <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                {day.events.map((ev, j) => (
                  <div
                    key={j}
                    className="flex gap-3 px-4 py-3"
                    style={{ borderTop: j > 0 ? '1px solid var(--border)' : 'none' }}
                  >
                    <span
                      className="text-sm font-medium w-12 shrink-0 pt-0.5"
                      style={{ fontFamily: "'DM Mono', monospace", color: 'var(--accent)' }}
                    >
                      {ev.time}
                    </span>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{ev.title}</p>
                      {ev.location && (
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{ev.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="section-title">Regels</p>
      <div className="card px-4 py-3">
        {schedule.rules.map((rule, i) => (
          <div key={i} className="flex gap-2.5 py-1.5">
            <span className="shrink-0 mt-0.5 text-sm" style={{ color: 'var(--accent)' }}>·</span>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{rule}</p>
          </div>
        ))}
      </div>

      <p className="section-title">Contact</p>
      <div className="card overflow-hidden">
        {[
          { label: 'Organisatie', value: schedule.contact.organizerName },
          { label: 'E-mail', value: schedule.contact.organizerEmail, href: `mailto:${schedule.contact.organizerEmail}` },
          { label: 'Telefoon', value: schedule.contact.organizerPhone, href: `tel:${schedule.contact.organizerPhone}`, mono: true },
          { label: 'Website', value: schedule.contact.website, href: `https://${schedule.contact.website}` },
        ].map(({ label, value, href, mono }, i) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 px-4 py-3"
            style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}
          >
            <span className="text-sm shrink-0" style={{ color: 'var(--text3)' }}>{label}</span>
            {href ? (
              <a
                href={href}
                className="text-sm font-medium text-right"
                style={{
                  color: 'var(--accent)',
                  fontFamily: mono ? "'DM Mono', monospace" : 'inherit',
                }}
              >
                {value}
              </a>
            ) : (
              <span className="text-sm font-medium text-right" style={{ color: 'var(--text)' }}>
                {value}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="pb-6" />
    </div>
  )
}
