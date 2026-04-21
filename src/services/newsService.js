import { db } from '../firebase'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'

export const subscribeToNews = (callback) => {
  const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    callback(items)
  })
}

export const addNewsItem = (title, body) =>
  addDoc(collection(db, 'news'), { title, body, createdAt: serverTimestamp() })

export const deleteNewsItem = (id) =>
  deleteDoc(doc(db, 'news', id))
