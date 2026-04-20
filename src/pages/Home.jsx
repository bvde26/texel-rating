const EVENT_DATE = new Date('2026-05-25')
const EVENT_EDITIE = 51

function daysUntil(date) {
  const now = new Date()
  const diff = date - new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const STATS = [
  { value: '290', label: 'Boten', accent: true },
  { value: '6',   label: 'Klassen' },
  { value: daysUntil(EVENT_DATE), label: 'Dagen te gaan' },
  { value: '~60', label: 'Zeemijlen' },
]

const LINKS = [
  { id: 'compare', label: 'Vergelijker',  dot: '#0066FF' },
  { id: 'schema',  label: 'Schema',       dot: '#10b981' },
  { id: 'uitleg',  label: 'Uitleg TR',    dot: '#f59e0b' },
]

export default function Home({ onNavigate }) {
  return (
    <div className="pt-4">

      <p className="section-title">
        Editie {EVENT_EDITIE} · 25 MEI
      </p>

      {/* Stat grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {STATS.map(({ value, label, accent }) => (
          <div
            key={label}
            className="card p-4"
            style={accent ? { background: 'var(--accent)', border: 'none' } : {}}
          >
            <p
              className="text-3xl font-bold leading-none mb-1"
              style={{
                fontFamily: "'DM Mono', monospace",
                color: accent ? '#fff' : 'var(--text)',
              }}
            >
              {value}
            </p>
            <p
              className="text-xs font-medium"
              style={{ color: accent ? 'rgba(255,255,255,0.75)' : 'var(--text3)' }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      <p className="section-title">Navigeer naar</p>

      {/* Nav links */}
      <div className="flex flex-col gap-2">
        {LINKS.map(({ id, label, dot }) => (
          <button
            key={id}
            onClick={() => onNavigate?.(id)}
            className="card flex items-center justify-between px-4 py-3.5 w-full text-left"
            style={{ borderRadius: '10px' }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: dot }}
              />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                {label}
              </span>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="var(--text3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ))}
      </div>

      <div className="pb-4" />
    </div>
  )
}
