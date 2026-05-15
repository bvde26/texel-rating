// src/pages/CatamaranIntro.jsx
import { useCallback, useEffect, useRef } from 'react'
import { createCatamaranScene } from '../three/catamaranScene.js'
import { useScrollProgress } from '../hooks/useScrollProgress.js'

export default function CatamaranIntro({ onDone }) {
  const wrapRef = useRef(null)
  const canvasHostRef = useRef(null)
  const sceneRef = useRef(null)
  const finishedRef = useRef(false)
  const timerRef = useRef(null)
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])
  const { progress, done } = useScrollProgress(wrapRef, true)

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

  // Scene-lifecycle
  useEffect(() => {
    const host = canvasHostRef.current
    if (!host) return
    const scene = createCatamaranScene(host)
    sceneRef.current = scene
    scene.start()
    const onResize = () => scene.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      scene.dispose()
      sceneRef.current = null
    }
  }, [])

  // Progress -> scène
  useEffect(() => {
    sceneRef.current?.update(progress)
  }, [progress])

  // Voltooiing: hold + fade -> onDone (timer alleen op unmount opruimen,
  // niet bij elke re-render — anders wist een re-render de hold-timer).
  useEffect(() => {
    if (!done || finishedRef.current || timerRef.current) return
    timerRef.current = setTimeout(() => fadeOut(650), 600)
  }, [done, fadeOut])

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const skip = () => fadeOut(400)

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed', inset: 0, background: '#e9eaec',
        touchAction: 'none', overflow: 'hidden', zIndex: 50,
      }}
    >
      <div ref={canvasHostRef} style={{ position: 'absolute', inset: 0 }} />
      <button
        onClick={skip}
        aria-label="Skip intro"
        style={{
          position: 'absolute', bottom: 22, left: '50%',
          transform: 'translateX(-50%)', background: 'transparent',
          border: 'none', cursor: 'pointer', padding: 12, opacity: 0.55,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
          stroke="#3a3f44" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  )
}
