// src/intro/introGate.js

function prefersReducedMotion() {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// Intro speelt elke keer bij het laden van de app.
// Alleen overslaan bij: reduced-motion of deeplink naar /beheer.
export function shouldSkipIntro() {
  if (typeof window === 'undefined') return true
  if (window.location.pathname === '/beheer') return true
  if (prefersReducedMotion()) return true
  return false
}
