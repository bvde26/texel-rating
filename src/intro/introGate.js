// src/intro/introGate.js
const KEY = 'texelrating:catamaranIntroSeen'

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// Intro overslaan als: flag gezet, reduced-motion, of deeplink naar /beheer.
export function shouldSkipIntro() {
  if (typeof window === 'undefined') return true
  if (window.location.pathname === '/beheer') return true
  if (prefersReducedMotion()) return true
  try {
    return window.localStorage.getItem(KEY) === '1'
  } catch {
    return false // privémodus: intro gewoon tonen
  }
}

export function markIntroSeen() {
  try {
    window.localStorage.setItem(KEY, '1')
  } catch {
    /* best-effort: geen blocker */
  }
}
