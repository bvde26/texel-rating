import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { title, body, secret } = req.body
  if (secret !== process.env.PUSH_SECRET) return res.status(403).json({ error: 'Forbidden' })
  if (!title || !body) return res.status(400).json({ error: 'Missing fields' })

  try {
    const db = getFirestore()
    const tokensSnap = await db.collection('fcm_tokens').get()
    const tokens = tokensSnap.docs.map(d => d.data().token).filter(Boolean)

    if (tokens.length === 0) return res.status(200).json({ sent: 0 })

    const messaging = getMessaging()
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      webpush: {
        notification: { icon: '/icon-192.png', badge: '/icon-192.png' },
      },
    })

    // Remove invalid tokens
    const toDelete = []
    response.responses.forEach((r, i) => {
      if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
        toDelete.push(tokens[i])
      }
    })
    await Promise.all(toDelete.map(t => db.collection('fcm_tokens').doc(t).delete()))

    res.status(200).json({ sent: response.successCount })
  } catch (err) {
    console.error('Push error:', err)
    res.status(500).json({ error: 'Internal error' })
  }
}
