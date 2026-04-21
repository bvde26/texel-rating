importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyCO2DA0aBHZNzRceEILpTYzbA3tlG5JDUw',
  authDomain: 'texel-rating.firebaseapp.com',
  projectId: 'texel-rating',
  storageBucket: 'texel-rating.firebasestorage.app',
  messagingSenderId: '961867744096',
  appId: '1:961867744096:web:8b0f4da716a18be60a5405',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification
  self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  })
})
