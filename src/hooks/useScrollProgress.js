// src/hooks/useScrollProgress.js
import { useEffect, useRef, useState } from 'react'

// Geaccumuleerde delta (px) die overeenkomt met progress 0 -> 1. Tunebaar.
export const SCROLL_DISTANCE_PX = 1400

function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

// smoothstep easing op de ruwe progress.
function ease(t) {
  return t * t * (3 - 2 * t)
}

// Vangt wheel + verticale touch-drag op het element en mapt naar progress.
// enabled=false => geen capture (reduced-motion pad).
export function useScrollProgress(targetRef, enabled = true) {
  const accRef = useRef(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const el = targetRef.current
    if (!el || !enabled) return

    let touchY = null

    const apply = (deltaPx) => {
      accRef.current = Math.max(0, Math.min(SCROLL_DISTANCE_PX, accRef.current + deltaPx))
      const p = ease(clamp01(accRef.current / SCROLL_DISTANCE_PX))
      setProgress(p)
      if (p >= 1) setDone(true)
    }

    const onWheel = (e) => {
      e.preventDefault()
      apply(e.deltaY)
    }
    const onTouchStart = (e) => {
      touchY = e.touches[0]?.clientY ?? null
    }
    const onTouchMove = (e) => {
      if (touchY == null) return
      const y = e.touches[0]?.clientY ?? touchY
      const dy = touchY - y // omhoog vegen = vooruit
      touchY = y
      e.preventDefault()
      apply(dy)
    }
    const onTouchEnd = () => {
      touchY = null
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [targetRef, enabled])

  return { progress, done }
}
