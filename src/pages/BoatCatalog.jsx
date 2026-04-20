import { useState, useMemo } from 'react'
import boats from '../data/boats.json'

export default function BoatCatalog() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('all')
  const [selectedBoat, setSelectedBoat] = useState(null)
  const [sortBy, setSortBy] = useState('name')

  const filtered = useMemo(() => {
    let results = boats.boats.filter(boat => {
      const matchesSearch =
        boat.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        boat.class.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClass = filterClass === 'all' || boat.class === filterClass
      return matchesSearch && matchesClass
    })

    if (sortBy === 'tr') results.sort((a, b) => a.trNoSpi - b.trNoSpi)
    else if (sortBy === 'name') results.sort((a, b) => a.type.localeCompare(b.type))
    else if (sortBy === 'crew') results.sort((a, b) => a.crew - b.crew)

    return results
  }, [searchTerm, filterClass, sortBy])

  const classes = useMemo(() => {
    return ['all', ...new Set(boats.boats.map(b => b.class))].sort()
  }, [])

  return (
    <div className="space-y-2">
      {/* Filters */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-4">
        <p className="text-xs font-['Bebas_Neue'] tracking-[0.15em] text-[var(--text2)] mb-3">BOTEN</p>

        <input
          type="text"
          placeholder="Zoek op naam of klasse..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2.5 bg-[var(--surface2)] border border-[var(--border2)] rounded-lg text-sm text-[var(--text)] placeholder-[var(--text3)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] mb-3"
        />

        {/* Class filter pills */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 mb-2">
          {classes.map(cls => (
            <button
              key={cls}
              onClick={() => setFilterClass(cls)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                filterClass === cls
                  ? 'bg-[var(--accent)] text-white border-transparent'
                  : 'bg-[var(--surface2)] text-[var(--text2)] border-[var(--border2)] hover:text-[var(--text)]'
              }`}
            >
              {cls === 'all' ? 'Alle' : cls}
            </button>
          ))}
        </div>

        {/* Sort pills */}
        <div className="flex gap-1.5">
          {[['name','Naam'],['tr','TR ↑'],['crew','Crew']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                sortBy === key
                  ? 'bg-[var(--surface2)] text-[var(--accent)] border-[var(--accent)]'
                  : 'bg-transparent text-[var(--text3)] border-[var(--border)] hover:text-[var(--text2)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-xs text-[var(--text3)] mt-2.5 font-['DM_Mono']">
          {filtered.length} / {boats.boats.length}
        </p>
      </div>

      {/* Boat list */}
      <div className="space-y-1.5">
        {filtered.map(boat => {
          const isOpen = selectedBoat?.id === boat.id
          return (
            <div
              key={boat.id}
              className={`bg-[var(--surface)] rounded-xl border transition-colors cursor-pointer ${
                isOpen ? 'border-[var(--accent)]' : 'border-[var(--border)] hover:border-[var(--border2)]'
              }`}
              onClick={() => setSelectedBoat(isOpen ? null : boat)}
            >
              <div className="flex items-center p-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text)] text-sm truncate">{boat.type}</p>
                  <p className="text-xs text-[var(--text2)] mt-0.5">{boat.class} · {boat.crew} pers</p>
                </div>
                <div className="text-right ml-3 shrink-0 flex items-center gap-2">
                  <div>
                    <p className="font-['DM_Mono'] text-lg font-medium text-[var(--accent)] leading-none">{boat.trNoSpi}</p>
                    <p className="text-[10px] text-[var(--text3)] text-center">TR</p>
                  </div>
                  <span className={`text-[var(--text3)] transition-transform duration-200 text-sm ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                </div>
              </div>

              {isOpen && (
                <div className="px-3 pb-3 border-t border-[var(--border)]">
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-[var(--surface2)] rounded-lg p-2.5 border border-[var(--border)]">
                      <p className="text-[10px] text-[var(--text3)]">Klasse</p>
                      <p className="text-sm font-semibold text-[var(--text)] mt-0.5">{boat.class}</p>
                    </div>
                    <div className="bg-[var(--surface2)] rounded-lg p-2.5 border border-[var(--border)]">
                      <p className="text-[10px] text-[var(--text3)]">Bemanning</p>
                      <p className="text-sm font-semibold text-[var(--text)] mt-0.5">{boat.crew} pers</p>
                    </div>
                    <div className="bg-[var(--surface2)] rounded-lg p-2.5 border border-[var(--border)]">
                      <p className="text-[10px] text-[var(--text3)]">TR geen spi</p>
                      <p className="font-['DM_Mono'] text-lg font-medium text-[var(--green)] mt-0.5">{boat.trNoSpi}</p>
                    </div>
                    <div className="bg-[var(--surface2)] rounded-lg p-2.5 border border-[var(--border)]">
                      <p className="text-[10px] text-[var(--text3)]">TR met spi</p>
                      <p className="font-['DM_Mono'] text-lg font-medium text-amber-400 mt-0.5">{boat.trWithSpi ?? '—'}</p>
                    </div>
                    {boat.rl && (
                      <div className="bg-[var(--surface2)] rounded-lg p-2.5 border border-[var(--border)]">
                        <p className="text-[10px] text-[var(--text3)]">Ratinglengte</p>
                        <p className="text-sm font-['DM_Mono'] text-[var(--text)] mt-0.5">{boat.rl} m</p>
                      </div>
                    )}
                    {boat.rsa && (
                      <div className="bg-[var(--surface2)] rounded-lg p-2.5 border border-[var(--border)]">
                        <p className="text-[10px] text-[var(--text3)]">Zeiloppervlak</p>
                        <p className="text-sm font-['DM_Mono'] text-[var(--text)] mt-0.5">{boat.rsa} m²</p>
                      </div>
                    )}
                    {boat.rw && (
                      <div className="bg-[var(--surface2)] rounded-lg p-2.5 border border-[var(--border)] col-span-2">
                        <p className="text-[10px] text-[var(--text3)]">Gewicht (incl. crew)</p>
                        <p className="text-sm font-['DM_Mono'] text-[var(--text)] mt-0.5">{boat.rw} kg</p>
                      </div>
                    )}
                  </div>
                  {boat.notes && (
                    <p className="mt-2 text-xs text-[var(--text2)] italic">{boat.notes}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="text-center text-[var(--text3)] py-12 text-sm bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            Geen boten gevonden
          </div>
        )}
      </div>
    </div>
  )
}
