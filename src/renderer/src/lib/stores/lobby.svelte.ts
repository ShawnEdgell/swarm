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
  serverTimestamp,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

class LobbyStore {
  rawUsers = $state<any[]>([])
  loading = $state(true)
  now = $state(Date.now())
  private unsubscribe: (() => void) | null = null
  private heartbeatInterval: any = null
  private authUnsubscribe: (() => void) | null = null

  onlineUsers = $derived.by(() => {
    return this.rawUsers
      .filter((u) => {
        if (!u.lastSeen) return true
        const lastSeenDate = u.lastSeen.toDate ? u.lastSeen.toDate() : new Date(u.lastSeen)
        const diffMinutes = (this.now - lastSeenDate.getTime()) / 1000 / 60
        return diffMinutes < 5
      })
      .sort((a, b) => {
        const getScore = (u: any) => (u.role === 'admin' ? 100 : u.role === 'host' ? 50 : 10)
        return getScore(b) - getScore(a) || (b.lastSeen?.seconds || 0) - (a.lastSeen?.seconds || 0)
      })
  })

  constructor() {
    console.log('🚀 [Lobby] Store Init. Project:', db.app.options.projectId)

    // 1. START SYNC IMMEDIATELY
    // This allows public users (unauthenticated) to see the list
    this.start()

    // 2. Auth listener is now ONLY for managing the local user session/heartbeat
    if (!this.authUnsubscribe) {
      this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log('👤 [Lobby] User logged in:', user.uid)
        } else {
          console.warn('⏳ [Lobby] Logged out / Public view')
          // Stop heartbeats if the user logs out while hosting
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
          }
        }
      })
    }

    setInterval(() => {
      this.now = Date.now()
    }, 10000)
  }

  // We no longer call stop() on logout because we want to keep seeing the list!
  // This just cleans up the Firestore listener if the component is destroyed.
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }

  async forceReconnect() {
    try {
      console.log('🔌 [Lobby] Forcing network reset...')
      await disableNetwork(db)
      await enableNetwork(db)
      console.log('🔌 [Lobby] Network reset complete.')
    } catch (e) {
      console.warn('🔌 [Lobby] Reconnect ignored (likely app closing)')
    }
  }

  start() {
    if (this.unsubscribe) return

    const q = query(collection(db, 'users'), where('isHosting', '==', true))

    this.unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(`📥 [Lobby] Public Sync Success! Hosts: ${snapshot.docs.length}`)
        this.rawUsers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        this.loading = false
      },
      async (error) => {
        console.error('❌ [Lobby] Firestore Error:', error.code, error.message)
        if (error.code === 'unavailable' || error.message.includes('offline')) {
          await this.forceReconnect()
        }
      }
    )
  }

  async setHosting(uid: string, isHosting: boolean, userData: any = {}) {
    // Hosting still requires a login
    if (!auth.currentUser) {
      console.error('❌ [Lobby] Auth required to host.')
      return
    }

    const currentUser = get(userStore)
    const userRef = doc(db, 'users', uid)

    const payload: any = {
      isHosting,
      lastSeen: serverTimestamp(),
      displayName: userData.displayName || currentUser?.name || 'Skater',
      photoURL: userData.photoURL || currentUser?.avatar || '',
      uid: uid,
      ...(isHosting ? { startedAt: serverTimestamp() } : {}),
      eaUsername: userData.eaUsername || '',
      note: userData.note || '',
      tags: userData.tags || [],
      role: userData.role || 'user',
      platform: 'desktop'
    }

    try {
      await setDoc(userRef, payload, { merge: true })
      console.log('✅ [Lobby] Status Updated:', isHosting ? 'Hosting' : 'Offline')

      if (isHosting) {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval)
        this.heartbeatInterval = setInterval(() => {
          setDoc(userRef, { lastSeen: serverTimestamp() }, { merge: true })
        }, 60000)
      } else {
        if (this.heartbeatInterval) {
          clearInterval(this.heartbeatInterval)
          this.heartbeatInterval = null
        }
      }
    } catch (err: any) {
      if (err.message.includes('offline')) await this.forceReconnect()
    }
  }
}

export const lobbyStore = new LobbyStore()
