export default function Home() {
  return (
    <div className="space-y-3">
      <div className="bg-blue-900 rounded-xl p-5 text-white">
        <p className="text-xs text-blue-300 font-semibold uppercase tracking-wider mb-1">Catamaran Race</p>
        <h2 className="text-2xl font-bold leading-tight">Round Texel</h2>
        <p className="text-blue-300 text-sm mt-1">8 juni 2025 · Den Hoorn, Texel</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl mb-1">⏱️</p>
          <p className="font-bold text-gray-900 text-sm">Tijdvergelijker</p>
          <p className="text-xs text-gray-400 mt-0.5">Bereken tijden per boot</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl mb-1">⛵</p>
          <p className="font-bold text-gray-900 text-sm">290 boten</p>
          <p className="text-xs text-gray-400 mt-0.5">Volledig bootsregister</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Programma 2025</p>
        <div className="space-y-2.5">
          <div className="flex gap-3">
            <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">Za 7 jun</span>
            <div>
              <p className="text-sm text-gray-700">Inschrijving open · 10:00</p>
              <p className="text-sm text-gray-700">Schippersmeeting · 15:00</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-xs text-gray-400 w-16 shrink-0 pt-0.5">Zo 8 jun</span>
            <div>
              <p className="text-sm font-bold text-gray-900">Start · 10:00</p>
              <p className="text-xs text-gray-400">Vertrek vanuit Den Hoorn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Texel Rating</p>
        <p className="text-sm text-amber-900 leading-relaxed">
          Hogere TR = meer tijd toegestaan. Gebruik de <strong>Vergelijker</strong> om te zien wat andere boten mogen varen ten opzichte van jou.
        </p>
      </div>
    </div>
  )
}
