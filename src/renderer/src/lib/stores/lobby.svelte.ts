import { db, auth } from '$lib/firebase'
import { user as userStore } from './user'
import { get } from 'svelte/store'
import { sortUsers } from '$lib/utils/hostHelpers' // Ensure this utility file exists
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

  /**
   * DERIVED DATA
   * Combines the raw Firebase data with our centralized sorting logic.
   * This updates automatically whenever rawUsers or now changes.
   */
  onlineUsers = $derived.by(() => {
    // 1. Filter out users who haven't sent a heartbeat in 5 minutes
    const active = this.rawUsers.filter((u) => {
      if (!u.lastSeen) return true
      const lastSeenDate = u.lastSeen.toDate ? u.lastSeen.toDate() : new Date(u.lastSeen)
      const diffMinutes = (this.now - lastSeenDate.getTime()) / 1000 / 60
      return diffMinutes < 5
    })

    // 2. Apply standardized sorting (Role > Prestige > ID)
    return sortUsers(active, this.now)
  })

  constructor() {
    this.start()

    // Monitor Auth state to kill heartbeat if user logs out
    if (!this.authUnsubscribe) {
      this.authUnsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          this.stopHeartbeat()
        }
      })
    }

    // Ticker to keep "Time Elapsed" and "Active Filter" fresh
    setInterval(() => {
      this.now = Date.now()
    }, 10000)
  }

  /**
   * PUBLIC ACTIONS
   */
  async toggleHosting(user: any, currentlySkating: boolean) {
    if (!user) return
    await this.setHosting(user.uid, !currentlySkating, user)
  }

  async updateProfileAndHost(uid: string, data: any) {
    const profile = {
      eaUsername: data.username,
      tags: data.tags,
      note: data.note,
      isHosting: true
    }
    await this.setHosting(uid, true, profile)
  }

  /**
   * FIREBASE SYNC LOGIC
   */
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
        // Electron-specific: Force reconnect if network drops (laptop lid closed, etc.)
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

    // Persistence Check: Don't reset startedAt if they are already hosting
    if (isHosting) {
      const existingUser = this.rawUsers.find((u) => u.id === uid)
      payload.startedAt = existingUser?.startedAt || serverTimestamp()
    } else {
      payload.startedAt = null
    }

    const tagsToSave = userData?.tags || currentUser?.tags
    if (tagsToSave && tagsToSave.length > 0) {
      payload.tags = tagsToSave
    }

    try {
      await setDoc(userRef, payload, { merge: true })

      if (isHosting) {
        // Start 60s Heartbeat to stay in the "Active" filter
        this.heartbeatInterval = setInterval(() => {
          setDoc(userRef, { lastSeen: serverTimestamp() }, { merge: true })
        }, 60000)
      }
    } catch (err: any) {
      console.error('Hosting error:', err)
    }
  }

  /**
   * LIFECYCLE & UTILS
   */
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
}

export const lobbyStore = new LobbyStore()
