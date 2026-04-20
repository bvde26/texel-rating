import { useState } from 'react'

export default function Home() {
  const [open, setOpen] = useState(null)

  return (
    <div>
      {/* Hero */}
      <div className="mt-5 card overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #02aaff 0%, #0090e0 100%)' }}>
        <div className="px-5 pt-5 pb-6">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-white opacity-70 mb-1">
            Catamaran Race · Texel
          </p>
          <h2 className="font-['Bebas_Neue'] text-[42px] tracking-[0.06em] leading-none text-white mb-2">
            Round Texel
          </h2>
          <p className="text-sm text-white opacity-80">8 juni 2025 · Den Hoorn</p>
        </div>
        <div className="flex" style={{ borderTop: '1px solid rgba(255,255,255,0.18)' }}>
          <div className="flex-1 px-5 py-3.5" style={{ borderRight: '0.5px solid rgba(255,255,255,0.18)' }}>
            <p className="font-['Bebas_Neue'] text-3xl text-white leading-none">290</p>
            <p className="text-[11px] text-white opacity-70 mt-0.5">Boten</p>
          </div>
          <div className="flex-1 px-5 py-3.5">
            <p className="font-['Bebas_Neue'] text-3xl text-white leading-none">2025</p>
            <p className="text-[11px] text-white opacity-70 mt-0.5">Editie</p>
          </div>
        </div>
      </div>

      {/* Programma */}
      <p className="section-title">Programma</p>
      <div className="card">
        {[
          {
            key: 'za', dag: 'Zaterdag 7 juni',
            items: [{ t: '10:00', n: 'Inschrijving open' }, { t: '15:00', n: 'Schippersmeeting' }]
          },
          {
            key: 'zo', dag: 'Zondag 8 juni',
            items: [{ t: '10:00', n: 'Start race', sub: 'Vertrek vanuit Den Hoorn' }]
          },
        ].map(({ key, dag, items }) => (
          <div key={key}>
            <button
              onClick={() => setOpen(open === key ? null : key)}
              className="row w-full flex items-center justify-between text-left"
            >
              <span className="text-[15px] font-medium" style={{ color: 'var(--text)' }}>{dag}</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                style={{
                  color: 'var(--text3)',
                  transform: open === key ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }}>
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {open === key && items.map((e, i) => (
              <div key={i} className="row flex gap-3 pl-5"
                style={{ backgroundColor: 'var(--surface2)' }}>
                <span className="font-['DM_Mono'] text-sm font-medium w-11 shrink-0 pt-0.5"
                  style={{ color: 'var(--accent)' }}>{e.t}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{e.n}</p>
                  {e.sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>{e.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* TR info */}
      <p className="section-title">Texel Rating</p>
      <div className="card row">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
          Hogere TR = meer tijd toegestaan. Gebruik de{' '}
          <span className="font-semibold" style={{ color: 'var(--text)' }}>Vergelijker</span>{' '}
          om te berekenen hoeveel tijd jouw concurrent meer of minder mag dan jij.
        </p>
      </div>
      <div className="pb-4" />
    </div>
  )
}
