import { useState } from 'react'
import Home from './pages/Home'
import TexelRatingInfo from './pages/TexelRatingInfo'
import BoatCatalog from './pages/BoatCatalog'
import RaceComparison from './pages/RaceComparison'
import Info from './pages/Info'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const navItems = [
    { id: 'home',    label: '🏠', title: 'Home',     page: <Home /> },
    { id: 'info',    label: 'ℹ️', title: 'Uitleg',   page: <TexelRatingInfo /> },
    { id: 'catalog', label: '⛵', title: 'Boten',    page: <BoatCatalog /> },
    { id: 'compare', label: '⏱️', title: 'Vergelijk', page: <RaceComparison /> },
    { id: 'schedule',label: '📅', title: 'Schema',   page: <Info /> },
  ]

  const active = navItems.find(i => i.id === currentPage)

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <header className="bg-[var(--bg)] px-4 py-3 flex items-center gap-3 border-b border-[var(--border)]">
        <div className="flex-1 min-w-0">
          <h1 className="font-['Bebas_Neue'] text-2xl tracking-widest leading-none text-[var(--accent)]">
            Round Texel
          </h1>
          <p className="text-xs text-[var(--text2)] leading-tight mt-0.5">{active?.title}</p>
        </div>
        <span className="text-xl opacity-60">{active?.label}</span>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-3 pb-24">
        <div className="max-w-lg mx-auto">
          {navItems.map(item =>
            currentPage === item.id && <div key={item.id}>{item.page}</div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 nav-glass border-t border-[var(--border2)]">
        <div className="flex max-w-lg mx-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex-1 pt-2 pb-2.5 flex flex-col items-center gap-0.5 border-t-2 transition-colors ${
                currentPage === item.id
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--text3)] hover:text-[var(--text2)]'
              }`}
            >
              <span className="text-lg leading-none">{item.label}</span>
              <span className="text-[10px] font-['Bebas_Neue'] tracking-wider leading-tight">{item.title}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App
