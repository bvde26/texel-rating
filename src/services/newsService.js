import { db, auth } from '../firebase'
import { collection, deleteDoc, updateDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'

export const subscribeToNews = (callback, onError) => {
  const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(items)
  }, (err) => {
    console.error('Firestore news error:', err)
    if (onError) onError(err)
    else callback([])
  })
}

export const addNewsItem = async (title, body) => {
  const user = auth.currentUser
  if (!user) throw new Error('Niet ingelogd')
  const idToken = await user.getIdToken()
  const res = await fetch('/api/post-news', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ title, body }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const deleteNewsItem = (id) =>
  deleteDoc(doc(db, 'news', id))

export const updateNewsItem = (id, { title, body }) =>
  updateDoc(doc(db, 'news', id), { title, body, updatedAt: serverTimestamp() })
