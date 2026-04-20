import { useState } from 'react'
import Home from './pages/Home'
import RaceComparison from './pages/RaceComparison'
import Info from './pages/Info'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const navItems = [
    { id: 'home',    label: '🏠', title: 'Home',     page: <Home /> },
    { id: 'compare', label: '⏱️', title: 'Vergelijk', page: <RaceComparison /> },
    { id: 'schedule',label: '📅', title: 'Schema',   page: <Info /> },
  ]

  const active = navItems.find(i => i.id === currentPage)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <header className="bg-white px-4 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex-1 min-w-0">
          <h1 className="font-['Bebas_Neue'] text-2xl tracking-widest leading-none" style={{ color: 'var(--accent)' }}>
            Round Texel
          </h1>
          <p className="text-xs leading-tight mt-0.5" style={{ color: 'var(--text2)' }}>{active?.title}</p>
        </div>
        <span className="text-xl opacity-50">{active?.label}</span>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-3 pb-28">
        <div className="max-w-lg mx-auto">
          {navItems.map(item =>
            currentPage === item.id && <div key={item.id}>{item.page}</div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 nav-bg">
        <div className="flex max-w-lg mx-auto px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className="flex-1 py-2 flex flex-col items-center gap-0.5 transition-colors"
              style={{ minHeight: '60px' }}
            >
              <div
                className="flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all"
                style={{
                  backgroundColor: currentPage === item.id ? 'var(--accent-light)' : 'transparent',
                  color: currentPage === item.id ? 'var(--accent)' : 'var(--text3)',
                }}
              >
                <span className="text-xl leading-none">{item.label}</span>
                <span className="text-[10px] font-['Bebas_Neue'] tracking-wider leading-tight">{item.title}</span>
              </div>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App
