import { useState } from 'react'

export default function TexelRatingInfo() {
  const [expanded, setExpanded] = useState(null)

  const sections = [
    {
      id: 'what',
      title: 'Wat is Texel Rating?',
      content: 'Texel Rating (TR) is een handicapsysteem waarmee boten van verschillende klassen en groottes eerlijk samen kunnen racen. In plaats van aparte races per klasse doen alle boten mee aan één race. De uitslag wordt berekend op basis van het TR-nummer.'
    },
    {
      id: 'formula',
      title: 'De formule',
      content: 'TR = 100 / (1.15 × RL⁰·³ × RSA⁰·⁴ / RW⁰·³²⁵)',
      details: {
        'RL (Ratinglengte)': 'Effectieve lengte van de boot (LOA minus overhangen)',
        'RSA (Ratingzeiloppervlak)': 'Totaal zeiloppervlak inclusief grootzeil, fok en spinnaker (m²)',
        'RW (Ratinggewicht)': 'Bootgewicht + crewgewicht (kg)',
        'Resultaat': 'Hogere TR = meer tijd toegestaan. Lagere TR = minder tijd, de boot wordt verwacht sneller te zijn.'
      }
    },
    {
      id: 'example',
      title: 'Voorbeeld: Hobie 14 vs Hobie 16',
      content: 'Jij vaart op een Hobie 16 (TR 113) en finisht in 4:00 uur. Hoe lang mag een Hobie 14 (TR 119) doen?',
      details: {
        'Hobie 16 (jij)': 'TR 113 — racetijd: 4:00',
        'Hobie 14': 'TR 119 — toegestane tijd: 4:00 × (119÷113) = 4:13',
        'Resultaat': 'Hobie 14 mag 13 minuten langer doen. Hogere TR = meer tijd = langzamere boot met meer handicap.'
      }
    },
    {
      id: 'factors',
      title: 'Extra correctiefactoren',
      content: 'De basisformule wordt aangepast voor:',
      details: {
        'Stabiliteit': 'Boten met lage stabiliteitsratio krijgen hogere TR (langzamer)',
        'Zwaard': 'Boten zonder efficiënt zwaard krijgen +4% TR-straf',
        'Spinnaker': 'Éénpersoonsboten met spinnaker krijgen +1% op de TR'
      }
    },
    {
      id: 'how-to-use',
      title: 'Hoe gebruik je deze app?',
      content: '1. Zoek je boot in het Botenregister en bekijk je TR. 2. Gebruik de Vergelijker om je racetijd in te voeren en te zien wat andere boten mogen varen. 3. Lagere gecorrigeerde tijden winnen!'
    }
  ]

  return (
    <div className="space-y-3">
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] text-[var(--text2)] mb-2">TEXEL RATING UITGELEGD</p>
        <p className="text-sm text-[var(--text2)] leading-relaxed">
          Texel Rating maakt eerlijke competitie mogelijk tussen verschillende bootklassen via handicapcorrecties op basis van bootsspecificaties.
        </p>
      </div>

      <div className="space-y-1.5">
        {sections.map(section => (
          <div key={section.id} className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === section.id ? null : section.id)}
              className="w-full px-4 py-3.5 text-left flex items-center justify-between hover:bg-[var(--surface2)] transition-colors"
            >
              <span className="font-semibold text-sm text-[var(--text)]">{section.title}</span>
              <span className={`text-[var(--text3)] transition-transform duration-200 text-sm ml-2 shrink-0 ${expanded === section.id ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {expanded === section.id && (
              <div className="px-4 pb-4 border-t border-[var(--border)] space-y-3 pt-3">
                {section.id === 'formula' ? (
                  <div className="bg-[var(--bg)] rounded-lg px-3 py-2.5 border border-[var(--border2)]">
                    <p className="font-['DM_Mono'] text-sm text-[var(--accent)]">{section.content}</p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text2)]">{section.content}</p>
                )}

                {section.details && (
                  <div className="bg-[var(--surface2)] rounded-lg p-3 space-y-2 border border-[var(--border)]">
                    {Object.entries(section.details).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="text-xs font-semibold text-[var(--accent)] min-w-28 shrink-0">{key}:</span>
                        <span className="text-xs text-[var(--text2)]">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[var(--surface)] rounded-xl p-4 border-l-4 border-[var(--accent)] border border-[var(--border)]">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] text-[var(--accent)] mb-1">KERNPUNT</p>
        <p className="text-sm text-[var(--text2)] leading-relaxed">
          Texel Rating zorgt voor een gelijk speelveld. Een langzamere boot met hoge TR kan via eerlijke handicap toch winnen van een snellere boot met lage TR.
        </p>
      </div>
    </div>
  )
}
