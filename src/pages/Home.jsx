export default function Home() {
  return (
    <div className="space-y-3">
      {/* Hero */}
      <div className="relative rounded-xl overflow-hidden hero-bg px-5 pt-8 pb-12">
        <p className="text-xs text-[var(--accent)] font-['Bebas_Neue'] tracking-[0.2em] mb-2 opacity-80">
          CATAMARAN RACE · TEXEL
        </p>
        <h2 className="font-['Bebas_Neue'] text-5xl tracking-wider text-white leading-none mb-1">
          Round Texel
        </h2>
        <p className="text-[var(--text2)] text-sm">8 juni 2025 · Den Hoorn</p>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 28" className="w-full block fill-[var(--bg)]" preserveAspectRatio="none">
            <path d="M0,14 C360,28 720,0 1080,14 C1260,21 1380,7 1440,14 L1440,28 L0,28 Z"/>
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)]">
          <p className="font-['Bebas_Neue'] text-3xl text-[var(--accent)] leading-none">⏱</p>
          <p className="font-semibold text-[var(--text)] text-sm mt-1">Tijdvergelijker</p>
          <p className="text-xs text-[var(--text2)] mt-0.5">Bereken tijden per boot</p>
        </div>
        <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)]">
          <p className="font-['Bebas_Neue'] text-3xl text-[var(--accent)] leading-none">290</p>
          <p className="font-semibold text-[var(--text)] text-sm mt-1">Boten</p>
          <p className="text-xs text-[var(--text2)] mt-0.5">Volledig register 2025</p>
        </div>
      </div>

      {/* Programma */}
      <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border)]">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] text-[var(--text2)] mb-3">PROGRAMMA 2025</p>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <span className="font-['DM_Mono'] text-xs text-[var(--accent)] w-16 shrink-0 pt-0.5">ZA 7 JUN</span>
            <div className="text-sm text-[var(--text2)] space-y-0.5">
              <p>Inschrijving open · <span className="font-['DM_Mono'] text-[var(--text)]">10:00</span></p>
              <p>Schippersmeeting · <span className="font-['DM_Mono'] text-[var(--text)]">15:00</span></p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <span className="font-['DM_Mono'] text-xs text-[var(--accent)] w-16 shrink-0 pt-0.5">ZO 8 JUN</span>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">
                Start · <span className="font-['DM_Mono']">10:00</span>
              </p>
              <p className="text-xs text-[var(--text2)]">Vertrek vanuit Den Hoorn</p>
            </div>
          </div>
        </div>
      </div>

      {/* TR uitleg */}
      <div className="bg-[var(--surface)] rounded-xl p-4 border-l-4 border-[var(--accent)] border border-[var(--border)]">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] text-[var(--accent)] mb-1">TEXEL RATING</p>
        <p className="text-sm text-[var(--text2)] leading-relaxed">
          Hogere TR = meer tijd toegestaan. Gebruik de <span className="text-[var(--text)] font-semibold">Vergelijker</span> om te zien wat andere boten mogen varen ten opzichte van jou.
        </p>
      </div>
    </div>
  )
}
