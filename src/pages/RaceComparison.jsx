import { useState, useMemo } from 'react'
import boats from '../data/boats.json'

const CLASSES = ['Alle', 'Foiler', 'High Performance', 'Performance', 'Intermediate', 'Recreational', 'Single-handed']
const CLASS_SHORT = { 'High Performance': 'High Perf.', 'Intermediate': 'Interm.', 'Recreational': 'Recreat.', 'Single-handed': 'Single' }

const getTR = (boat, spi) => spi && boat.trWithSpi ? boat.trWithSpi : boat.trNoSpi

function SpiToggle({ value, onChange, small }) {
  return (
    <div
      className="flex gap-1 p-0.5 rounded-lg"
      style={{ backgroundColor: '#f3f4f6', display: 'inline-flex' }}
    >
      {[false, true].map(v => (
        <button
          key={String(v)}
          onClick={() => onChange(v)}
          className={`py-1 rounded-md transition-all ${small ? 'px-2 text-xs' : 'px-3 text-sm'} font-medium`}
          style={{
            background: value === v ? '#fff' : 'transparent',
            color: value === v ? 'var(--text)' : 'var(--text3)',
            boxShadow: value === v ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
          }}
        >
          {v ? 'Met spi' : 'Geen spi'}
        </button>
      ))}
    </div>
  )
}

function BoatBrowser({ excludeIds = [], onSelect }) {
  const [filter, setFilter] = useState('Alle')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() =>
    boats.boats
      .filter(b => {
        if (excludeIds.includes(b.id)) return false
        if (filter !== 'Alle' && b.class !== filter) return false
        if (search && !b.type.toLowerCase().includes(search.toLowerCase())) return false
        return true
      })
      .sort((a, b) => a.type.localeCompare(b.type))
  , [filter, search, excludeIds])

  return (
    <div>
      {/* Search */}
      <div className="mb-2">
        <input
          type="text"
          placeholder="Zoek boot…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
          style={{ background: '#fff', border: '1px solid var(--border)', color: 'var(--text)' }}
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2">
        {CLASSES.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: filter === c ? 'var(--accent)' : '#fff',
              color: filter === c ? '#fff' : 'var(--text2)',
              border: `1px solid ${filter === c ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {CLASS_SHORT[c] || c}
          </button>
        ))}
      </div>

      {/* Boat list */}
      <div className="card overflow-hidden">
        <div style={{ maxHeight: '240px', overflowY: 'auto' }} className="scrollbar-none">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text3)' }}>
              Geen boten gevonden
            </p>
          ) : filtered.map((b, i) => (
            <button
              key={b.id}
              onClick={() => onSelect(b)}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
              style={{
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{b.type}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{b.class}</p>
              </div>
              <span
                className="text-sm font-medium ml-2 flex-shrink-0"
                style={{ fontFamily: "'DM Mono', monospace", color: 'var(--accent)' }}
              >
                {b.trNoSpi}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function RaceComparison() {
  const [myBoat, setMyBoat] = useState(null)
  const [mySpi, setMySpi] = useState(false)
  const [finishTime, setFinishTime] = useState('')
  const [compBoats, setCompBoats] = useState([])
  const [addingBoat, setAddingBoat] = useState(false)

  const finishSec = useMemo(() => {
    if (!finishTime) return 0
    const [h, m] = finishTime.split(':').map(Number)
    return (h * 60 + m) * 60
  }, [finishTime])

  const myTR = myBoat ? getTR(myBoat, mySpi) : null

  const results = useMemo(() => {
    if (!myBoat || !finishSec || !myTR) return []
    return compBoats
      .map(({ boat, spi }) => {
        const compTR = getTR(boat, spi)
        const allowed = finishSec * (compTR / myTR)
        const diff = allowed - finishSec
        return { boat, spi, compTR, allowed, diff }
      })
      .sort((a, b) => b.diff - a.diff)
  }, [myBoat, finishSec, compBoats, myTR])

  const fmtDiff = s => {
    const abs = Math.abs(Math.round(s / 60))
    const h = Math.floor(abs / 60), m = abs % 60
    return h > 0 ? `${h}u ${m}m` : `${m}`
  }

  const fmtDiffLabel = s => {
    const abs = Math.abs(Math.round(s / 60))
    const h = Math.floor(abs / 60)
    return h > 0 ? (s >= 0 ? 'voordeel' : 'nadeel') : (s >= 0 ? 'min voordeel' : 'min nadeel')
  }

  const excludeIds = [myBoat?.id, ...compBoats.map(b => b.boat.id)].filter(Boolean)

  return (
    <div className="pt-4">

      {/* Section 1: Jouw boot */}
      <p className="section-title">Jouw boot</p>

      {!myBoat ? (
        <BoatBrowser excludeIds={[]} onSelect={b => { setMyBoat(b); setCompBoats([]) }} />
      ) : (
        <div
          className="card p-4"
          style={{ border: '1.5px solid var(--accent)', background: 'var(--accent-bg)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{myBoat.type}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
                {myBoat.class} ·{' '}
                <span style={{ fontFamily: "'DM Mono', monospace", color: 'var(--accent)' }}>
                  TR {myTR}
                </span>
              </p>
            </div>
            <button
              onClick={() => { setMyBoat(null); setCompBoats([]) }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: '#fff', color: 'var(--accent)', border: '1px solid var(--accent)' }}
            >
              Wijzig
            </button>
          </div>
          <SpiToggle value={mySpi} onChange={setMySpi} />
        </div>
      )}

      {/* Section 2: Jouw tijd */}
      {myBoat && (
        <>
          <p className="section-title mt-4">Jouw tijd (uu:mm)</p>
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={finishTime}
              onChange={e => setFinishTime(e.target.value)}
              placeholder="04:00"
              className="flex-1 px-4 py-3 rounded-xl focus:outline-none text-center"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '18px',
                fontWeight: 500,
                color: finishTime ? 'var(--accent)' : 'var(--text3)',
                background: '#fff',
                border: '1px solid var(--border)',
              }}
            />
            <button
              onClick={() => setAddingBoat(v => !v)}
              className="px-4 py-3 rounded-xl text-sm font-semibold flex-shrink-0"
              style={{
                background: addingBoat ? 'var(--accent)' : 'var(--accent-bg)',
                color: addingBoat ? '#fff' : 'var(--accent)',
              }}
            >
              {addingBoat ? '− Annuleer' : '+ Boot'}
            </button>
          </div>

          {addingBoat && (
            <div className="mt-3">
              <BoatBrowser
                excludeIds={excludeIds}
                onSelect={b => {
                  setCompBoats(p => [...p, { boat: b, spi: false }])
                  setAddingBoat(false)
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Section 3: Scoreboard */}
      {myBoat && (
        <>
          <p className="section-title mt-4">Scoreboard</p>

          {results.length === 0 ? (
            <div
              className="card px-4 py-8 text-center"
              style={{ color: 'var(--text3)', fontSize: '14px' }}
            >
              Voeg een boot toe om te vergelijken
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map(({ boat, spi, compTR, diff }) => {
                const isAhead = diff >= 0
                const color = isAhead ? 'var(--green)' : 'var(--red)'
                return (
                  <div
                    key={boat.id}
                    className="card overflow-hidden"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <div className="flex items-center justify-between px-4 pt-3 pb-2">
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                          {boat.type}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                          {boat.class} ·{' '}
                          <span style={{ fontFamily: "'DM Mono', monospace" }}>TR {compTR}</span>
                        </p>
                        <div className="mt-1.5">
                          <SpiToggle
                            small
                            value={spi}
                            onChange={v =>
                              setCompBoats(p =>
                                p.map(b => b.boat.id === boat.id ? { ...b, spi: v } : b)
                              )
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-end ml-3">
                        <span
                          className="leading-none font-bold"
                          style={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: '22px',
                            color,
                          }}
                        >
                          {isAhead ? '+' : '−'}{fmtDiff(diff)}
                        </span>
                        <span className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>
                          {fmtDiffLabel(diff)}
                        </span>
                        <button
                          onClick={() =>
                            setCompBoats(p => p.filter(b => b.boat.id !== boat.id))
                          }
                          className="mt-2 text-xs"
                          style={{ color: 'var(--text3)' }}
                        >
                          × verwijder
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <div className="pb-6" />
    </div>
  )
}
