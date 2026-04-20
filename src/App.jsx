import { useState } from 'react'
import Logo from './components/Logo'
import Home from './pages/Home'
import RaceComparison from './pages/RaceComparison'
import Info from './pages/Info'
import TexelRatingInfo from './pages/TexelRatingInfo'

const NAV = [
  { id: 'home',    label: 'Home',     Page: Home },
  { id: 'compare', label: 'Vergelijk', Page: RaceComparison },
  { id: 'schema',  label: 'Schema',   Page: Info },
  { id: 'uitleg',  label: 'Uitleg',   Page: TexelRatingInfo },
]

export default function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Sticky header */}
      <header className="sticky top-0 z-50 bg-white" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-sm mx-auto px-4">
          {/* Logo row */}
          <div className="pt-3 pb-2">
            <Logo size={22} />
          </div>

          {/* Pill-nav */}
          <div className="pb-2">
            <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: '#f3f4f6' }}>
              {NAV.map(({ id, label }) => {
                const isActive = page === id
                return (
                  <button
                    key={id}
                    onClick={() => setPage(id)}
                    className="flex-1 text-center rounded-md py-1.5 text-xs font-semibold transition-all"
                    style={{
                      background: isActive ? '#fff' : 'transparent',
                      color: isActive ? 'var(--text)' : 'var(--text3)',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}>
        <div className="max-w-sm mx-auto px-4">
          {NAV.map(({ id, Page }) =>
            page === id && <Page key={id} onNavigate={setPage} />
          )}
        </div>
      </main>
    </div>
  )
}
