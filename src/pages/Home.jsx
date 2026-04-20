import { useState } from 'react'

export default function Home() {
  const [programmaOpen, setProgrammaOpen] = useState(false)

  return (
    <div className="space-y-3">
      {/* Hero card */}
      <div className="rounded-[20px] p-6 text-white" style={{ backgroundColor: 'var(--accent)' }}>
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.2em] mb-2 opacity-75">
          CATAMARAN RACE · TEXEL
        </p>
        <h2 className="font-['Bebas_Neue'] text-5xl tracking-widest leading-none mb-1">
          Round Texel
        </h2>
        <p className="text-sm opacity-80">8 juni 2025 · Den Hoorn</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="font-['Bebas_Neue'] text-3xl leading-none" style={{ color: 'var(--accent)' }}>290</p>
          <p className="font-semibold text-sm mt-1" style={{ color: 'var(--text)' }}>Boten</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>Volledig register 2025</p>
        </div>
        <div className="card p-4">
          <p className="font-['Bebas_Neue'] text-3xl leading-none" style={{ color: 'var(--accent)' }}>⏱</p>
          <p className="font-semibold text-sm mt-1" style={{ color: 'var(--text)' }}>Vergelijker</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>Bereken tijden per boot</p>
        </div>
      </div>

      {/* Programma card */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setProgrammaOpen(o => !o)}
          className="w-full px-5 py-4 flex items-center justify-between transition-colors"
          style={{ backgroundColor: programmaOpen ? 'var(--surface2)' : 'transparent' }}
        >
          <span className="text-xs font-['Bebas_Neue'] tracking-[0.15em]" style={{ color: 'var(--text2)' }}>
            PROGRAMMA 2025
          </span>
          <span
            className="text-sm transition-transform duration-200"
            style={{ color: 'var(--text3)', transform: programmaOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >▾</span>
        </button>

        {programmaOpen && (
          <div className="px-5 pb-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex gap-3 items-start pt-3">
              <span className="font-['DM_Mono'] text-xs w-16 shrink-0 pt-0.5" style={{ color: 'var(--accent-text)' }}>ZA 7 JUN</span>
              <div className="text-sm space-y-0.5" style={{ color: 'var(--text2)' }}>
                <p>Inschrijving open · <span className="font-['DM_Mono']" style={{ color: 'var(--text)' }}>10:00</span></p>
                <p>Schippersmeeting · <span className="font-['DM_Mono']" style={{ color: 'var(--text)' }}>15:00</span></p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <span className="font-['DM_Mono'] text-xs w-16 shrink-0 pt-0.5" style={{ color: 'var(--accent-text)' }}>ZO 8 JUN</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  Start · <span className="font-['DM_Mono']">10:00</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>Vertrek vanuit Den Hoorn</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TR uitleg card */}
      <div className="card p-5" style={{ borderLeft: '4px solid var(--accent)' }}>
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] mb-1" style={{ color: 'var(--accent-text)' }}>
          TEXEL RATING
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>
          Hogere TR = meer tijd toegestaan. Gebruik de{' '}
          <span className="font-semibold" style={{ color: 'var(--text)' }}>Vergelijker</span>{' '}
          om te zien wat andere boten mogen varen ten opzichte van jou.
        </p>
      </div>
    </div>
  )
}
