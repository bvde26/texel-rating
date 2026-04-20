import { useState } from 'react'

export default function TexelRatingInfo() {
  const [expanded, setExpanded] = useState(null)

  const sections = [
    {
      id: 'what',
      title: 'What is Texel Rating?',
      content: 'Texel Rating (TR) is a handicap system that allows boats of different classes and sizes to race together fairly. Instead of having separate races for each class, all boats compete in one race, and results are calculated based on their TR number.'
    },
    {
      id: 'formula',
      title: 'The Formula',
      content: 'TR = 100 / (1.15 × RL^0.3 × RSA^0.4 / RW^0.325)',
      details: {
        'RL (Rated Length)': 'The boat\'s effective length (Length Overall minus overhangs)',
        'RSA (Rated Sail Area)': 'Total sail area including main, jib, and spinnaker (in m²)',
        'RW (Rated Weight)': 'Boat weight + crew weight (in kg)',
        'Result': 'Hogere TR = meer tijd toegestaan. Lagere TR = minder tijd, boot wordt verwacht sneller te zijn.'
      }
    },
    {
      id: 'example',
      title: 'Voorbeeld: Hobie 14 vs Hobie 16',
      content: 'Jij vaart op een Hobie 16 (TR 113) en finish in 4:00 uur. Hoe lang mag een Hobie 14 (TR 119) doen?',
      details: {
        'Hobie 16 (jij)': 'TR 113 — racetijd: 4:00',
        'Hobie 14': 'TR 119 — toegestane tijd: 4:00 × (119÷113) = 4:13',
        'Resultaat': 'Hobie 14 mag 13 minuten langer doen. Hogere TR = meer tijd = langzamere boot met meer handicap.'
      }
    },
    {
      id: 'factors',
      title: 'Additional Factors',
      content: 'The base formula is adjusted for:',
      details: {
        'Stability': 'Boats with low stability ratio get higher TR (slower)',
        'Centerboards': 'Boats without efficient centerboards get +4% TR penalty',
        'Spinnaker': 'Single-handed boats with spinnaker get +1% to TR'
      }
    },
    {
      id: 'how-to-use',
      title: 'How to Use This App',
      content: '1. Browse the Boat Catalog to find your boat and see its TR rating. 2. Use Race Comparison to enter your finish time and see how you rank against other boats. 3. Lower corrected times win!'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-blue-900 mb-3">Understanding Texel Rating</h2>
        <p className="text-gray-700">
          Texel Rating enables fair competition between different boat classes by applying handicap corrections based on boat specifications.
        </p>
      </div>

      <div className="space-y-3">
        {sections.map(section => (
          <div key={section.id} className="bg-white rounded-lg shadow overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === section.id ? null : section.id)}
              className="w-full px-6 py-4 text-left bg-blue-50 hover:bg-blue-100 transition flex items-center justify-between font-semibold text-blue-900"
            >
              <span>{section.title}</span>
              <span className="text-2xl">{expanded === section.id ? '−' : '+'}</span>
            </button>

            {expanded === section.id && (
              <div className="px-6 py-4 border-t space-y-4">
                <p className="text-gray-700">{section.content}</p>

                {section.details && (
                  <div className="bg-blue-50 rounded p-4 space-y-2">
                    {Object.entries(section.details).map(([key, value]) => (
                      <div key={key} className="flex gap-3">
                        <span className="font-semibold text-blue-900 min-w-32">{key}:</span>
                        <span className="text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-6">
        <h3 className="font-semibold text-yellow-900 mb-2">💡 Key Takeaway</h3>
        <p className="text-yellow-800 text-sm">
          Texel Rating levels the playing field. A slower boat with a low TR number can beat a faster boat with a high TR number through fair handicap adjustment.
        </p>
      </div>
    </div>
  )
}
