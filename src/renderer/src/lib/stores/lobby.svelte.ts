import { db, auth } from '$lib/firebase'
import { user as userStore } from './user'
import { get } from 'svelte/store'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'

class LobbyStore {
  rawUsers = $state<any[]>([])
  loading = $state(true)
  now = $state(Date.now())
  private unsubscribe: (() => void) | null = null
  private heartbeatInterval: any = null // Added this inside the class

  onlineUsers = $derived.by(() => {
    return this.rawUsers
      .filter((u) => {
        if (!u.lastSeen) return true
        const lastSeenDate = u.lastSeen.toDate ? u.lastSeen.toDate() : new Date(u.lastSeen)
        const diffMinutes = (this.now - lastSeenDate.getTime()) / 1000 / 60
        // We'll keep this at 10 mins as a "safety net" for crashes
        return diffMinutes < 10
      })
      .sort((a, b) => {
        const getScore = (u: any) => (u.role === 'admin' ? 100 : u.role === 'host' ? 50 : 10)
        return getScore(b) - getScore(a) || (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0)
      })
  })

  constructor() {
    this.start()
    setInterval(() => {
      this.now = Date.now()
    }, 10000)
  }

  start() {
    if (this.unsubscribe) return
    const q = query(collection(db, 'users'), where('isHosting', '==', true))
    this.unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        this.rawUsers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        this.loading = false
      },
      () => {
        console.warn('Lobby blocked. Waiting for login...')
      }
    )
  }

  async setHosting(uid: string, isHosting: boolean, userData: any = {}) {
    if (auth.currentUser?.uid !== uid) {
      console.error('Auth mismatch!')
      return
    }

    const currentUser = get(userStore)
    const userRef = doc(db, 'users', uid)

    const payload: any = {
      isHosting,
      lastSeen: serverTimestamp(),
      name: userData.name || currentUser?.name || 'Skater',
      avatar: userData.avatar || currentUser?.avatar || ''
    }

    if (userData.eaUsername || currentUser?.eaUsername) {
      payload.eaUsername = userData.eaUsername || currentUser?.eaUsername
    }
    if (userData.note || currentUser?.note) {
      payload.note = userData.note || currentUser?.note
    }

    // --- HEARTBEAT LOGIC ---
    if (isHosting) {
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = setInterval(() => {
        console.log('💓 Heartbeat: Pinging server...')
        this.setHosting(uid, true, userData)
      }, 60000)
    } else {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = null
      }
    }

    try {
      await setDoc(userRef, payload, { merge: true })
      console.log('✅ Hosting updated for:', payload.name)
    } catch (err) {
      console.error('Firestore Permission Denied.', err)
    }
  }
}

export const lobbyStore = new LobbyStore()
