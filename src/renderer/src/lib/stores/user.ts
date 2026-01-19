import { writable } from 'svelte/store'
import { auth } from '../firebase'
import { signInAnonymously, signOut } from 'firebase/auth'
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

      // Sign in to Firebase to unlock Firestore
      await signInAnonymously(auth)

      // Set the user store with normalized data
      user.set({
        uid: twitchUser.id,
        displayName: twitchUser.display_name,
        photoURL: twitchUser.profile_image_url,
        roles: [], // Prevents 'undefined' errors
        ...twitchUser
      })

      console.log('Logged in and Identity Synced!')
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
    // 1. Get the current user ID before signing out
    let currentId: string | null = null
    user.subscribe((u) => (currentId = u?.uid))()

    // 2. Force unhost in the database if an ID exists
    if (currentId) {
      await lobbyStore.setHosting(currentId, false)
    }

    // 3. Complete the Firebase sign-out
    await signOut(auth)
    user.set(null)
    console.log('Logged out and Session Terminated.')
  } catch (err) {
    console.error('Logout error:', err)
  }
}
