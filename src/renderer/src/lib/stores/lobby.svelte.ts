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

  /**
   * STABLE SORTING & FILTERING
   * 1. Filters users inactive for > 5 minutes
   * 2. Sorts by Role (Admin > Host > Creator > Member)
   * 3. Tie-breaker: Oldest session (startedAt) first.
   * 4. Hard Tie-breaker: ID string comparison to prevent "jumping" during heartbeats.
   */
  onlineUsers = $derived.by(() => {
    return this.rawUsers
      .filter((u) => {
        if (!u.lastSeen) return true
        const lastSeenDate = u.lastSeen.toDate ? u.lastSeen.toDate() : new Date(u.lastSeen)
        const diffMinutes = (this.now - lastSeenDate.getTime()) / 1000 / 60
        return diffMinutes < 5
      })
      .sort((a, b) => {
        // Tier 1: Role Priority
        const getScore = (u: any) => {
          if (u.role === 'admin') return 100
          if (u.role === 'host') return 50
          if (u.role === 'creator') return 30
          return 10
        }

        const scoreDiff = getScore(b) - getScore(a)
        if (scoreDiff !== 0) return scoreDiff

        // Tier 2: Session Prestige (Oldest startedAt first)
        const timeA = a.startedAt?.seconds || a.startedAt || a.lastSeen?.seconds || 0
        const timeB = b.startedAt?.seconds || b.startedAt || b.lastSeen?.seconds || 0

        if (timeA !== timeB) return timeA - timeB

        // Tier 3: Hard Tie-breaker (Stabilizes the list when timestamps match or are missing)
        return a.id.localeCompare(b.id)
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

    // Update 'now' every 10 seconds for the UI timers and filter
    setInterval(() => {
      this.now = Date.now()
    }, 10000)
  }

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

    // FIX: Only set startedAt if they are starting a fresh session
    if (isHosting) {
      const existingUser = this.rawUsers.find((u) => u.id === uid)
      // If they were already hosting, keep the old timestamp, otherwise set new one
      payload.startedAt = existingUser?.startedAt || serverTimestamp()
    } else {
      // Clear start time when they stop hosting
      payload.startedAt = null
    }

    const tagsToSave = userData?.tags || currentUser?.tags
    if (tagsToSave && tagsToSave.length > 0) {
      payload.tags = tagsToSave
    }

    try {
      await setDoc(userRef, payload, { merge: true })

      if (isHosting) {
        // HEARTBEAT: Only update lastSeen to keep them on the radar
        // Never update startedAt here or the list will jump
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
