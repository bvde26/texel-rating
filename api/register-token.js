import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'

function normalizePrivateKey(raw) {
  if (!raw) return raw
  let key = raw.trim()
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1)
  }
  return key.replace(/\\n/g, '\n')
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
    }),
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { token } = req.body
  if (!token || typeof token !== 'string' || token.length < 20) {
    return res.status(400).json({ error: 'Invalid token' })
  }
  try {
    const db = getFirestore()
    await db.collection('fcm_tokens').doc(token).set({
      token,
      createdAt: FieldValue.serverTimestamp(),
    })
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Register token error:', err)
    res.status(500).json({ error: err.message || 'Internal error' })
  }
}
