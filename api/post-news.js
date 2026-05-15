import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { getAuth } from 'firebase-admin/auth'

const ADMIN_EMAIL = 'bramvdelst@gmail.com'

// Push tijdelijk volledig uit (niet in gebruik). Zet op true om notificaties
// bij nieuwe nieuwsberichten weer mee te sturen.
const PUSH_ENABLED = false

function normalizePrivateKey(raw) {
  if (!raw) return raw
  let key = raw.trim()
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1)
  }
  key = key.replace(/\\n/g, '\n')
  return key
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

  const authHeader = req.headers.authorization || ''
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!idToken) return res.status(401).json({ error: 'Unauthorized' })

  let decoded
  try {
    decoded = await getAuth().verifyIdToken(idToken)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
  if (decoded.email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Forbidden' })

  const { title, body } = req.body
  if (!title || !body) return res.status(400).json({ error: 'Missing fields' })

  try {
    const db = getFirestore()
    const docRef = await db.collection('news').add({
      title,
      body,
      createdAt: FieldValue.serverTimestamp(),
    })

    // Send push in parallel
    let pushSent = 0
    if (PUSH_ENABLED) try {
      const tokensSnap = await db.collection('fcm_tokens').get()
      const tokens = tokensSnap.docs.map(d => d.data().token).filter(Boolean)
      if (tokens.length > 0) {
        const response = await getMessaging().sendEachForMulticast({
          tokens,
          notification: { title, body },
          webpush: { notification: { icon: '/icon-192.png', badge: '/icon-192.png' } },
        })
        pushSent = response.successCount
        const toDelete = []
        response.responses.forEach((r, i) => {
          if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
            toDelete.push(tokens[i])
          }
        })
        await Promise.all(toDelete.map(t => db.collection('fcm_tokens').doc(t).delete()))
      }
    } catch (e) {
      console.error('Push error:', e)
    }

    res.status(200).json({ id: docRef.id, pushSent })
  } catch (err) {
    console.error('Post news error:', err)
    res.status(500).json({ error: err.message || 'Internal error' })
  }
}
