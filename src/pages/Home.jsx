import { useState } from 'react'

export default function Home() {
  const [programmaOpen, setProgrammaOpen] = useState(null)

  return (
    <div>
      {/* Event card */}
      <p className="ios-section-label">EVENT</p>
      <div className="ios-card px-4 py-4" style={{ backgroundColor: 'var(--accent-bg)' }}>
        <p className="text-xs font-medium mb-1" style={{ color: 'var(--accent)' }}>CATAMARAN RACE · TEXEL</p>
        <h2 className="font-['Bebas_Neue'] text-4xl tracking-widest leading-none mb-1" style={{ color: 'var(--label)' }}>
          Round Texel
        </h2>
        <p className="text-sm" style={{ color: 'var(--label2)' }}>8 juni 2025 · Den Hoorn</p>
      </div>

      {/* Info rows */}
      <p className="ios-section-label">INFORMATIE</p>
      <div className="ios-card">
        <div className="ios-row flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--label)' }}>290 boten geregistreerd</span>
          <span className="text-sm" style={{ color: 'var(--label3)' }}>›</span>
        </div>
        <div className="ios-row flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: 'var(--label)' }}>Tijdvergelijker</span>
          <span className="text-sm" style={{ color: 'var(--label3)' }}>›</span>
        </div>
      </div>

      {/* Programma */}
      <p className="ios-section-label">PROGRAMMA</p>
      <div className="ios-card">
        {[
          { key: 'za', dag: 'Za 7 juni', events: [{ tijd: '10:00', naam: 'Inschrijving open' }, { tijd: '15:00', naam: 'Schippersmeeting' }] },
          { key: 'zo', dag: 'Zo 8 juni', events: [{ tijd: '10:00', naam: 'Start race', sub: 'Vertrek vanuit Den Hoorn' }] },
        ].map(dag => (
          <div key={dag.key}>
            <button
              onClick={() => setProgrammaOpen(programmaOpen === dag.key ? null : dag.key)}
              className="ios-row w-full flex items-center justify-between text-left"
            >
              <span className="text-sm font-medium" style={{ color: 'var(--label)' }}>{dag.dag}</span>
              <span
                className="text-xs transition-transform duration-200"
                style={{
                  color: 'var(--label3)',
                  transform: programmaOpen === dag.key ? 'rotate(90deg)' : 'rotate(0deg)',
                }}
              >›</span>
            </button>
            {programmaOpen === dag.key && dag.events.map((e, i) => (
              <div
                key={i}
                className="ios-row flex items-start gap-3 pl-8"
                style={{ backgroundColor: 'var(--surface2)' }}
              >
                <span className="text-sm font-['DM_Mono'] shrink-0 w-12" style={{ color: 'var(--accent)' }}>{e.tijd}</span>
                <div>
                  <p className="text-sm" style={{ color: 'var(--label)' }}>{e.naam}</p>
                  {e.sub && <p className="text-xs mt-0.5" style={{ color: 'var(--label2)' }}>{e.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* TR uitleg */}
      <p className="ios-section-label">TEXEL RATING</p>
      <div className="ios-card ios-row">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--label2)' }}>
          Hogere TR = meer tijd toegestaan. Gebruik de <span className="font-semibold" style={{ color: 'var(--label)' }}>Vergelijker</span> om te zien wat andere boten mogen varen ten opzichte van jou.
        </p>
      </div>
    </div>
  )
}
