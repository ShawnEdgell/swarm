import { writable, get } from 'svelte/store'
import { auth, db } from '../firebase'
import { signInAnonymously } from 'firebase/auth'
import { doc, getDoc, onSnapshot } from 'firebase/firestore' // Added onSnapshot
import { lobbyStore } from './lobby.svelte'

export const user = writable<any>(null)

if (window.api?.onTwitchToken) {
  window.api.onTwitchToken(async (token) => {
    try {
      const res = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Client-Id': 'uxujallmnmpm0iu1zr8olid58tnmh2'
        }
      })
      const { data } = await res.json()
      if (!data || data.length === 0) throw new Error('No Twitch user found')

      const twitchUser = data[0]

      let firebaseUser = auth.currentUser
      if (!firebaseUser) {
        const userCredential = await signInAnonymously(auth)
        firebaseUser = userCredential.user
      }

      const firebaseUid = firebaseUser.uid

      // 1. Initial Fetch to get the store started
      const userDoc = await getDoc(doc(db, 'users', firebaseUid))
      const dbData = userDoc.exists() ? userDoc.data() : {}

      const userData = {
        uid: firebaseUid,
        twitchId: twitchUser.id,
        name: twitchUser.display_name,
        avatar: twitchUser.profile_image_url,
        eaUsername: dbData.eaUsername || '',
        note: dbData.note || '',
        tags: dbData.tags || [],
        role: dbData.role || 'user'
      }

      user.set(userData)

      // 2. REAL-TIME SYNC: Watch for changes to roles, tags, or EA ID
      // This allows App.svelte to just use $user.role without extra logic
      onSnapshot(doc(db, 'users', firebaseUid), (snap) => {
        if (snap.exists()) {
          const latest = snap.data()
          user.update((u) =>
            u
              ? {
                  ...u,
                  role: latest.role || 'user',
                  tags: latest.tags || [],
                  eaUsername: latest.eaUsername || '',
                  note: latest.note || ''
                }
              : u
          )
        }
      })

      console.log('✅ Auth & Profile Sync Active. ID:', firebaseUid)
    } catch (e) {
      console.error('Auth Sync Failed:', e)
    }
  })
}

export const login = () => {
  if (window.electron) {
    window.electron.ipcRenderer.send('start-twitch-auth', {
      clientId: 'uxujallmnmpm0iu1zr8olid58tnmh2'
    })
  }
}

export const logout = async () => {
  try {
    const currentUser = get(user)

    if (currentUser?.uid) {
      // Pass a hard copy of tags/info so setHosting doesn't read a null store
      await lobbyStore.setHosting(currentUser.uid, false, {
        eaUsername: currentUser.eaUsername,
        note: currentUser.note,
        tags: currentUser.tags,
        displayName: currentUser.name
      })
    }

    user.set(null)
    console.log('Logout successful.')
  } catch (err) {
    console.error('Logout error:', err)
  }
}
