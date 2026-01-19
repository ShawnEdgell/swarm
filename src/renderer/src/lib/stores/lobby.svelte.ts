import { db } from '$lib/firebase'
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

  // This fixes the "Property onlineUsers does not exist" error
  onlineUsers = $derived.by(() => {
    return this.rawUsers
      .filter((u) => {
        if (!u.lastSeen) return true
        // Convert Firestore timestamp to JS Date if needed
        const lastSeenDate = u.lastSeen.toDate ? u.lastSeen.toDate() : new Date(u.lastSeen)
        const diffMinutes = (this.now - lastSeenDate.getTime()) / 1000 / 60
        return diffMinutes < 5 // Only show users active in the last 5 minutes
      })
      .sort((a, b) => {
        // Sort by role importance then by recency
        const getScore = (u: any) => (u.role === 'admin' ? 100 : u.role === 'host' ? 50 : 10)
        return getScore(b) - getScore(a) || (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0)
      })
  })

  constructor() {
    // Start syncing data immediately for public browsing
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
    const userRef = doc(db, 'users', uid)
    await setDoc(
      userRef,
      {
        ...userData,
        isHosting,
        lastSeen: serverTimestamp()
      },
      { merge: true }
    )
  }
}

export const lobbyStore = new LobbyStore()
