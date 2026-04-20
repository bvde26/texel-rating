import { useState } from 'react'
import Home from './pages/Home'
import RaceComparison from './pages/RaceComparison'
import Info from './pages/Info'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const navItems = [
    { id: 'home',     label: '🏠', title: 'Home',     page: <Home /> },
    { id: 'compare',  label: '⏱️', title: 'Vergelijk', page: <RaceComparison /> },
    { id: 'schedule', label: '📅', title: 'Schema',   page: <Info /> },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* iOS Navigation Bar */}
      <header
        className="bg-white px-4 pt-3 pb-3 flex items-center"
        style={{ boxShadow: '0 0.5px 0 rgba(0,0,0,0.12)' }}
      >
        <h1 className="font-['Bebas_Neue'] text-2xl tracking-widest leading-none" style={{ color: 'var(--accent)' }}>
          Round Texel
        </h1>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto px-4 pb-4">
          {navItems.map(item =>
            currentPage === item.id && <div key={item.id}>{item.page}</div>
          )}
        </div>
      </main>

      {/* iOS Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 tab-bar">
        <div className="flex max-w-lg mx-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 transition-colors"
              style={{ minHeight: '49px', color: currentPage === item.id ? 'var(--accent)' : 'var(--label3)' }}
            >
              <span className="text-xl leading-none">{item.label}</span>
              <span className="text-[10px] font-medium leading-tight">{item.title}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App
