import { useState } from 'react'
import Home from './pages/Home'
import Info from './pages/Info'
import TexelRatingInfo from './pages/TexelRatingInfo'
import BoatCatalog from './pages/BoatCatalog'
import RaceComparison from './pages/RaceComparison'
import Registrations from './pages/Registrations'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  const navItems = [
    { id: 'home', label: '🏠', title: 'Home', page: <Home /> },
    { id: 'info', label: 'ℹ️', title: 'Info', page: <TexelRatingInfo /> },
    { id: 'catalog', label: '⛵', title: 'Boats', page: <BoatCatalog /> },
    { id: 'compare', label: '⏱️', title: 'Compare', page: <RaceComparison /> },
    { id: 'schedule', label: '📅', title: 'Schedule', page: <Info /> },
  ]

  const currentNavItem = navItems.find(item => item.id === currentPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg px-4 py-4">
        <h1 className="text-2xl font-bold">Round Texel</h1>
        <p className="text-sm text-blue-100">{currentNavItem?.title || 'Catamaran Race'}</p>
      </header>

      {/* Main Content - grows to fill space */}
      <main className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {navItems.map(item => (
          currentPage === item.id && <div key={item.id}>{item.page}</div>
        ))}
      </main>

      {/* Bottom Navigation - fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex justify-around max-w-full">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex-1 py-3 text-center transition flex flex-col items-center gap-1 ${
                currentPage === item.id
                  ? 'text-blue-600 border-t-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <span className="text-xl">{item.label}</span>
              <span className="text-xs font-semibold">{item.title}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default App
