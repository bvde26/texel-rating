import { db, getMessagingInstance } from '../firebase'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'

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
      await setDoc(doc(db, 'fcm_tokens', token), { token, createdAt: new Date().toISOString() })
    }
    return token
  } catch {
    return null
  }
}

export const removePushToken = async (token) => {
  if (!token) return
  await deleteDoc(doc(db, 'fcm_tokens', token))
}
