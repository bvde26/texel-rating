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
    { id: 'home', label: '🏠', title: 'Home', page: <Home /> },
    { id: 'info', label: 'ℹ️', title: 'Uitleg', page: <TexelRatingInfo /> },
    { id: 'catalog', label: '⛵', title: 'Boten', page: <BoatCatalog /> },
    { id: 'compare', label: '⏱️', title: 'Vergelijk', page: <RaceComparison /> },
    { id: 'schedule', label: '📅', title: 'Schema', page: <Info /> },
  ]

  const active = navItems.find(i => i.id === currentPage)

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-900 text-white px-4 py-3 shadow-md flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold tracking-wide leading-tight">Round Texel 2025</h1>
          <p className="text-xs text-blue-300 leading-tight">{active?.title}</p>
        </div>
        <span className="text-2xl opacity-70">{active?.label}</span>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-3 pb-24">
        <div className="max-w-lg mx-auto">
          {navItems.map(item =>
            currentPage === item.id && <div key={item.id}>{item.page}</div>
          )}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex max-w-lg mx-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex-1 pt-2 pb-2.5 flex flex-col items-center gap-0.5 border-t-2 transition-colors ${
                currentPage === item.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl leading-none">{item.label}</span>
              <span className="text-[10px] font-semibold leading-tight">{item.title}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App
