import { useState } from 'react'
import Home from './pages/Home'
import Info from './pages/Info'
import TexelRating from './pages/TexelRating'
import Registrations from './pages/Registrations'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Round Texel 2025</h1>
          <p className="text-blue-100">Catamaran Race Information Hub</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-blue-800 sticky top-0 z-50 shadow">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4 py-3 overflow-x-auto">
            <button
              onClick={() => setCurrentPage('home')}
              className={`px-4 py-2 rounded whitespace-nowrap transition ${
                currentPage === 'home'
                  ? 'bg-white text-blue-900 font-semibold'
                  : 'text-white hover:bg-blue-700'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('info')}
              className={`px-4 py-2 rounded whitespace-nowrap transition ${
                currentPage === 'info'
                  ? 'bg-white text-blue-900 font-semibold'
                  : 'text-white hover:bg-blue-700'
              }`}
            >
              Schedule & Info
            </button>
            <button
              onClick={() => setCurrentPage('rating')}
              className={`px-4 py-2 rounded whitespace-nowrap transition ${
                currentPage === 'rating'
                  ? 'bg-white text-blue-900 font-semibold'
                  : 'text-white hover:bg-blue-700'
              }`}
            >
              Texel Rating
            </button>
            <button
              onClick={() => setCurrentPage('registrations')}
              className={`px-4 py-2 rounded whitespace-nowrap transition ${
                currentPage === 'registrations'
                  ? 'bg-white text-blue-900 font-semibold'
                  : 'text-white hover:bg-blue-700'
              }`}
            >
              Registrations
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {currentPage === 'home' && <Home />}
        {currentPage === 'info' && <Info />}
        {currentPage === 'rating' && <TexelRating />}
        {currentPage === 'registrations' && <Registrations />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p>&copy; 2025 Round Texel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
