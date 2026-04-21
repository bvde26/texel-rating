import { getMessagingInstance } from '../firebase'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

export const requestPushPermission = async () => {
  if (!VAPID_KEY) return null
  const messaging = await getMessagingInstance()
  if (!messaging) return null

  const { getToken } = await import('firebase/messaging')
  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return null
    const token = await getToken(messaging, { vapidKey: VAPID_KEY })
    if (token) {
      await fetch('/api/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
    }
    return token
  } catch {
    return null
  }
}
