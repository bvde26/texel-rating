import { useEffect } from 'react'

export default function useVersionCheck(intervalMs = 60000) {
  useEffect(() => {
    let cancelled = false
    const check = async () => {
      try {
        const res = await fetch('/version.json', { cache: 'no-store' })
        if (!res.ok) return
        const { version } = await res.json()
        if (cancelled) return
        if (version && version !== __APP_VERSION__) {
          window.location.reload()
        }
      } catch {}
    }
    const onVisible = () => { if (document.visibilityState === 'visible') check() }
    document.addEventListener('visibilitychange', onVisible)
    const id = setInterval(check, intervalMs)
    check()
    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [intervalMs])
}
