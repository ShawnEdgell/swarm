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

  // Role-based sorting and 5-minute timeout filter
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
    this.start()

    if (!this.authUnsubscribe) {
      this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          this.stopHeartbeat()
        }
      })
    }

    setInterval(() => {
      this.now = Date.now()
    }, 10000)
  }

  // --- NEW: Helper for App.svelte toggle button ---
  async toggleHosting(user: any, currentlySkating: boolean) {
    if (!user) return
    await this.setHosting(user.uid, !currentlySkating, user)
  }

  // --- NEW: Helper for EASetupModal ---
  async updateProfileAndHost(uid: string, data: any) {
    const profile = {
      eaUsername: data.username,
      tags: data.tags,
      note: data.note,
      isHosting: true // Force hosting to true when they save setup
    }
    await this.setHosting(uid, true, profile)
  }

  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    this.stopHeartbeat()
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  async forceReconnect() {
    try {
      await disableNetwork(db)
      await enableNetwork(db)
    } catch (e) {
      console.warn('🔌 [Lobby] Reconnect ignored')
    }
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
      async (error) => {
        if (error.code === 'unavailable' || error.message.includes('offline')) {
          await this.forceReconnect()
        }
      }
    )
  }

  async setHosting(uid: string, isHosting: boolean, userData: any = null) {
    if (!auth.currentUser) return

    const userRef = doc(db, 'users', uid)
    this.stopHeartbeat()

    const currentUser = get(userStore)

    const payload: any = {
      isHosting,
      lastSeen: serverTimestamp(),
      displayName: userData?.displayName || currentUser?.name || 'Skater',
      eaUsername: userData?.eaUsername || currentUser?.eaUsername || '',
      note: userData?.note || currentUser?.note || '',
      photoURL: userData?.photoURL || currentUser?.avatar || '',
      uid: uid,
      platform: 'desktop'
    }

    const tagsToSave = userData?.tags || currentUser?.tags
    if (tagsToSave && tagsToSave.length > 0) {
      payload.tags = tagsToSave
    }

    try {
      await setDoc(userRef, payload, { merge: true })

      if (isHosting) {
        // Start heartbeat to keep the user in the "onlineUsers" derived list
        this.heartbeatInterval = setInterval(() => {
          setDoc(userRef, { lastSeen: serverTimestamp() }, { merge: true })
        }, 60000)
      }
    } catch (err: any) {
      console.error('Hosting error:', err)
    }
  }
}

export const lobbyStore = new LobbyStore()
