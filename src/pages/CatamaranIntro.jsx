// src/pages/CatamaranIntro.jsx
import { useCallback, useEffect, useRef } from 'react'
import { createCatamaranScene } from '../three/catamaranScene.js'

export default function CatamaranIntro({ onDone }) {
  const wrapRef = useRef(null)
  const canvasHostRef = useRef(null)
  const titleRef = useRef(null)
  const sceneRef = useRef(null)
  const finishedRef = useRef(false)
  const timerRef = useRef(null)
  const titleTimerRef = useRef(null)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  const fadeOut = useCallback((duration) => {
    if (finishedRef.current) return
    finishedRef.current = true
    const el = wrapRef.current
    if (el) {
      el.style.transition = `opacity ${duration}ms ease-in-out`
      el.style.opacity = '0'
    }
    setTimeout(() => onDoneRef.current?.(), duration)
  }, [])

  // Scene-lifecycle. Als de animatie klaar is → korte hold → fade → Home.
  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return
    const scene = createCatamaranScene(host, {
      onComplete: () => {
        if (finishedRef.current || timerRef.current) return
        timerRef.current = setTimeout(() => fadeOut(650), 500)
      },
    })
    sceneRef.current = scene
    scene.start()
    // Titel fade-in rond het "snap"-moment (catamaran klikt samen).
    titleTimerRef.current = setTimeout(() => {
      const t = titleRef.current
      if (t) t.style.opacity = '1'
    }, 2700)
    const onResize = () => scene.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(timerRef.current)
      clearTimeout(titleTimerRef.current)
      scene.dispose()
      sceneRef.current = null
    }
  }, [fadeOut])

  // Klik / toets waar dan ook → meteen door naar de pagina.
  const skip = () => fadeOut(400)

  return (
    <div
      ref={wrapRef}
      onClick={skip}
      role="button"
      tabIndex={0}
      aria-label="Doorgaan naar de pagina"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') skip()
      }}
      style={{
        position: 'fixed', inset: 0, background: '#F6F2E9',
        touchAction: 'none', overflow: 'hidden', zIndex: 50,
        cursor: 'pointer',
      }}
    >
      <div ref={canvasHostRef} style={{ position: 'absolute', inset: 0 }} />
      <div
        ref={titleRef}
        style={{
          position: 'absolute', top: '13%', left: '50%',
          transform: 'translateX(-50%)', opacity: 0,
          transition: 'opacity 1100ms ease-out',
          font: '600 clamp(20px, 3.4vw, 38px)/1.1 Inter, system-ui, sans-serif',
          color: '#1A1F1A', letterSpacing: '0.16em', whiteSpace: 'nowrap',
          textTransform: 'uppercase', pointerEvents: 'none',
          textShadow: '0 1px 14px rgba(246,242,233,0.9)',
        }}
      >
        -= Round Texel Info =-
      </div>
      <div
        style={{
          position: 'absolute', bottom: 22, left: '50%',
          transform: 'translateX(-50%)', opacity: 0.5,
          font: '500 13px/1 Inter, system-ui, sans-serif',
          color: '#3a3f44', letterSpacing: '0.04em', pointerEvents: 'none',
        }}
      >
        klik om door te gaan
      </div>
    </div>
  )
}
