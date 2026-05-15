import { getMessagingInstance } from '../firebase'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

// Push is tijdelijk volledig uitgeschakeld (niet in gebruik). Zet op true om
// notificaties weer aan te zetten — de rest van de flow blijft intact.
const PUSH_ENABLED = false

export const requestPushPermission = async () => {
  if (!PUSH_ENABLED) return null
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
