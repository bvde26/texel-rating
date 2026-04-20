import { useState } from 'react'
import Home from './pages/Home'
import RaceComparison from './pages/RaceComparison'
import Info from './pages/Info'
import './App.css'

const NAV = [
  { id: 'home',     icon: '⛵', label: 'Home',     Page: Home },
  { id: 'compare',  icon: '⏱',  label: 'Vergelijk', Page: RaceComparison },
  { id: 'schedule', icon: '📋', label: 'Schema',   Page: Info },
]

export default function App() {
  const [page, setPage] = useState('home')
  const active = NAV.find(n => n.id === page)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Header */}
      <header className="bg-white px-5 py-3.5 flex items-baseline gap-2.5"
        style={{ borderBottom: '0.5px solid rgba(12,30,48,0.08)' }}>
        <span className="font-['Bebas_Neue'] text-[22px] tracking-[0.12em] leading-none"
          style={{ color: 'var(--accent)' }}>Round Texel</span>
        <span className="text-sm font-medium" style={{ color: 'var(--text3)' }}>
          {active?.label}
        </span>
      </header>

      {/* Page */}
      <main className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-lg mx-auto px-4">
          {NAV.map(({ id, Page }) =>
            page === id && <Page key={id} />
          )}
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 nav-bar">
        <div className="flex max-w-lg mx-auto"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {NAV.map(({ id, icon, label }) => {
            const isActive = page === id
            return (
              <button key={id} onClick={() => setPage(id)}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors"
                style={{ minHeight: '52px', color: isActive ? 'var(--accent)' : 'var(--text3)' }}
              >
                <span className="text-[20px] leading-none">{icon}</span>
                <span className="text-[10px] font-semibold tracking-wide leading-none">
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
