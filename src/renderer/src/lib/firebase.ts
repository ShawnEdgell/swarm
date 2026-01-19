import { initializeApp, getApp, getApps } from 'firebase/app'
import { initializeFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAFLM-aTMxI-sTHlQPut_W9GRJOpAHPIXo',
  authDomain: 'openskate-84712.firebaseapp.com',
  projectId: 'openskate-84712',
  storageBucket: 'openskate-84712.firebasestorage.app',
  messagingSenderId: '60063627320',
  appId: '1:60063627320:web:8877bea5a1f3d4925bcecd'
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

// Keep the experimental polling for Electron stability
// and 'openskate' to match the website's database instance
export const db = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true
  },
  'openskate'
)

export const auth = getAuth(app)
