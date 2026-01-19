import { initializeApp } from 'firebase/app'
import { initializeFirestore } from 'firebase/firestore' // Use this instead of getFirestore
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyC8GpMRcr-dG3qTPRAy0CbZ8flwFK3KyZk',
  authDomain: 'swarm-20369.firebaseapp.com',
  projectId: 'swarm-20369',
  storageBucket: 'swarm-20369.firebasestorage.app',
  messagingSenderId: '396796287009',
  appId: '1:396796287009:web:bb7ebd724539632755ab60',
  measurementId: 'G-YWLHCS68ZR'
}

const app = initializeApp(firebaseConfig)

// Force Long Polling to fix the "Transport Errored" issue in Electron
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
})

export const auth = getAuth(app)
