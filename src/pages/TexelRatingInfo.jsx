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
      <div className="bg-white rounded-xl shadow-sm p-4">
        <h2 className="text-base font-bold text-gray-900 mb-2">Texel Rating uitgelegd</h2>
        <p className="text-sm text-gray-600">
          Texel Rating maakt eerlijke competitie mogelijk tussen verschillende bootklassen via handicapcorrecties op basis van bootsspecificaties.
        </p>
      </div>

      <div className="space-y-1.5">
        {sections.map(section => (
          <div key={section.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === section.id ? null : section.id)}
              className="w-full px-4 py-3.5 text-left flex items-center justify-between"
            >
              <span className="font-semibold text-sm text-gray-900">{section.title}</span>
              <span className={`text-gray-400 text-xl leading-none transition-transform ${expanded === section.id ? 'rotate-180' : ''}`}>▾</span>
            </button>

            {expanded === section.id && (
              <div className="px-4 pb-4 border-t border-gray-100 space-y-3 pt-3">
                <p className="text-sm text-gray-700">{section.content}</p>

                {section.details && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    {Object.entries(section.details).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <span className="font-semibold text-xs text-gray-700 min-w-32 shrink-0">{key}:</span>
                        <span className="text-xs text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Kernpunt</p>
        <p className="text-sm text-amber-900 leading-relaxed">
          Texel Rating zorgt voor een gelijk speelveld. Een langzamere boot met hoge TR kan via eerlijke handicap toch winnen van een snellere boot met lage TR.
        </p>
      </div>
    </div>
  )
}
