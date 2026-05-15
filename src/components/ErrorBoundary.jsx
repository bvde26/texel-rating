import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('App crash:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, fontFamily: 'Outfit, sans-serif', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Er ging iets mis</div>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '12px 20px', borderRadius: 12, background: '#000', color: '#fff', border: 'none', fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
          >
            Opnieuw laden
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
