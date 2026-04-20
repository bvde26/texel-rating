import { useState } from 'react'

const SECTIONS = [
  {
    id: 'what',
    title: 'Wat is Texel Rating?',
    body: 'Texel Rating (TR) is een handicapsysteem waarmee boten van verschillende klassen eerlijk samen kunnen racen. Alle boten doen mee aan één race; de uitslag wordt berekend op basis van het TR-nummer.',
  },
  {
    id: 'formula',
    title: 'De formule',
    formula: 'TR = 100 / (1.15 × RL⁰·³ × RSA⁰·⁴ / RW⁰·³²⁵)',
    details: [
      ['RL', 'Ratinglengte — effectieve lengte van de boot'],
      ['RSA', 'Ratingzeiloppervlak — totaal zeiloppervlak (m²)'],
      ['RW', 'Ratinggewicht — boot + crew (kg)'],
      ['Hogere TR', 'Meer tijd toegestaan → langzamere boot'],
    ],
  },
  {
    id: 'example',
    title: 'Voorbeeld: Hobie 14 vs Hobie 16',
    body: 'Jij vaart op een Hobie 16 (TR 113) en finisht in 4:00. Hoeveel tijd mag een Hobie 14 (TR 119)?',
    details: [
      ['Hobie 16 (jij)', 'TR 113 — racetijd 4:00'],
      ['Hobie 14', 'TR 119 — toegestaan: 4:00 × (119÷113) = 4:13'],
      ['Resultaat', '+13 minuten voordeel voor de Hobie 14'],
    ],
  },
  {
    id: 'factors',
    title: 'Correctiefactoren',
    body: 'De basisformule wordt aangepast voor:',
    details: [
      ['Stabiliteit', 'Lage stabiliteitsratio → hogere TR (straf)'],
      ['Zwaard', 'Zonder efficiënt zwaard → +4% TR'],
      ['Spinnaker', 'Éénpersoons met spi → +1% TR'],
    ],
  },
  {
    id: 'how-to-use',
    title: 'Hoe gebruik je deze app?',
    body: '1. Zoek je boot in de Vergelijker en bekijk je TR. 2. Voer je racetijd in en voeg concurrenten toe. 3. Lagere gecorrigeerde tijden winnen!',
  },
]

function Chevron({ open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      style={{ color: 'var(--text3)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
    >
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function TexelRatingInfo() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="pt-4">
      <p className="section-title">Texel Rating uitgelegd</p>

      <div className="card overflow-hidden mb-4">
        {SECTIONS.map((s, i) => (
          <div key={s.id} style={{ borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
            <button
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              className="w-full flex items-center justify-between text-left px-4 py-3.5"
            >
              <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{s.title}</span>
              <Chevron open={expanded === s.id} />
            </button>

            {expanded === s.id && (
              <div
                className="px-4 pb-4 pt-3 space-y-3"
                style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)' }}
              >
                {s.formula && (
                  <div
                    className="px-3 py-2.5 rounded-lg"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    <p
                      className="text-sm"
                      style={{ fontFamily: "'DM Mono', monospace", color: 'var(--accent)' }}
                    >
                      {s.formula}
                    </p>
                  </div>
                )}

                {s.body && (
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{s.body}</p>
                )}

                {s.details && (
                  <div
                    className="rounded-lg overflow-hidden"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    {s.details.map(([key, val], j) => (
                      <div
                        key={key}
                        className="flex gap-3 px-3 py-2.5"
                        style={{ borderTop: j > 0 ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}
                      >
                        <span
                          className="text-xs font-semibold shrink-0 w-24"
                          style={{ color: 'var(--accent)' }}
                        >
                          {key}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text2)' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Kernpunt */}
      <div
        className="card px-4 py-3.5"
        style={{ borderLeft: '3px solid var(--accent)' }}
      >
        <p className="text-xs font-semibold tracking-wider uppercase mb-1" style={{ color: 'var(--accent)' }}>
          Kernpunt
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
          Een langzamere boot met hoge TR kan via eerlijke handicap toch winnen van een snellere boot met lage TR.
        </p>
      </div>

      <div className="pb-6" />
    </div>
  )
}
