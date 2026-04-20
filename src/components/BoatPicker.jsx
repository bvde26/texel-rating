import { useState, useEffect } from 'react'
import { Icon } from './icons'
import Pressable from './Pressable'

export default function BoatPicker({ t, boats, registrations = [], excludeIds, onPick, onClose }) {
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  const close = () => {
    setVisible(false)
    setTimeout(onClose, 240)
  }

  const q = query.trim().toLowerCase()

  const boatResults = boats.filter(b => {
    if (excludeIds.includes(b.id)) return false
    if (!q) return true
    return b.type.toLowerCase().includes(q)
  }).sort((a, b) => a.type.localeCompare(b.type))

  const regResults = q ? registrations.filter(r => {
    const linked = boats.find(b => b.id === r.boatId)
    if (!linked || excludeIds.includes(linked.id)) return false
    return (
      r.skipper.toLowerCase().includes(q) ||
      (r.crew || '').toLowerCase().includes(q) ||
      r.sailNumber.toLowerCase().includes(q) ||
      r.boatName.toLowerCase().includes(q)
    )
  }) : []

  const totalCount = boatResults.length + regResults.length

  const pickReg = (reg) => {
    const boat = boats.find(b => b.id === reg.boatId)
    if (boat) onPick(boat)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* Scrim */}
      <div
        onClick={close}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 200ms ease-out',
        }}
      />

      {/* Sheet */}
      <div style={{
        position: 'relative',
        background: 'var(--bg)',
        borderRadius: '24px 24px 0 0',
        overflow: 'hidden',
        height: '88%',
        display: 'flex',
        flexDirection: 'column',
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 320ms cubic-bezier(0.22,1,0.36,1)',
      }}>

        {/* Handle */}
        <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 4, borderRadius: 4, background: 'rgba(0,0,0,0.15)' }}/>
        </div>

        {/* Title row */}
        <div style={{ padding: '6px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 20, letterSpacing: -0.3 }}>
            {t.pick_boat}
          </div>
          <Pressable
            onClick={close}
            style={{
              width: 32, height: 32, borderRadius: 999,
              background: 'rgba(0,0,0,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon.Close size={14} color="#000"/>
          </Pressable>
        </div>

        {/* Search */}
        <div style={{ padding: '0 16px 10px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--surface)', borderRadius: 12,
            border: '1px solid var(--border2)',
            padding: '12px 14px', height: 48,
          }}>
            <Icon.Search size={16} color="rgba(0,0,0,0.45)"/>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.search_placeholder}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                fontFamily: 'Outfit, sans-serif', fontSize: 16, color: '#000',
                letterSpacing: -0.2,
              }}
            />
            {query && (
              <Pressable onClick={() => setQuery('')} style={{ padding: 4, borderRadius: 999 }}>
                <Icon.Close size={14} color="rgba(0,0,0,0.5)"/>
              </Pressable>
            )}
          </div>
        </div>

        {/* Count */}
        <div style={{
          padding: '0 20px 8px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: 'rgba(0,0,0,0.45)', letterSpacing: 0.8,
        }}>
          {totalCount} {totalCount === 1 ? 'BOOT' : 'BOTEN'}
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 16px 32px' }} className="scrollbar-none">
          {totalCount === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', fontFamily: 'Outfit, sans-serif', color: 'rgba(0,0,0,0.5)' }}>
              {t.no_results}
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>

              {/* Registration results */}
              {regResults.map(reg => {
                const boat = boats.find(b => b.id === reg.boatId)
                return (
                  <Pressable
                    key={reg.id}
                    onClick={() => pickReg(reg)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px',
                      background: 'var(--surface)',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 15, color: '#000', letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {reg.skipper}{reg.crew ? ` / ${reg.crew}` : ''}
                      </div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(0,0,0,0.5)', marginTop: 2, letterSpacing: 0.2 }}>
                        {reg.sailNumber} · {boat?.type}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 600, color: '#000', letterSpacing: -0.5, flexShrink: 0 }}>
                      {reg.spinnaker ? boat?.trWithSpi : boat?.trNoSpi}
                    </div>
                  </Pressable>
                )
              })}

              {/* Divider between reg and boat results */}
              {regResults.length > 0 && boatResults.length > 0 && (
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(0,0,0,0.35)', letterSpacing: 0.8, padding: '4px 2px' }}>
                  BOOTTYPE
                </div>
              )}

              {/* Boat type results */}
              {boatResults.map(b => (
                <Pressable
                  key={b.id}
                  onClick={() => onPick(b)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    background: 'var(--surface)',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 15, color: '#000', letterSpacing: -0.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.type}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 600, color: '#000', letterSpacing: -0.5, flexShrink: 0 }}>
                    {b.trNoSpi}
                  </div>
                </Pressable>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
