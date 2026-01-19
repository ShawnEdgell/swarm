<script lang="ts">
  import { onMount } from 'svelte'
  import { user, login, logout } from '$lib/stores/user'
  import { lobbyStore } from '$lib/stores/lobby.svelte'
  import { db } from '$lib/firebase'
  import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore'

  // Components
  import ControlBar from './components/ControlBar.svelte'
  import HostList from './components/HostList.svelte'
  import InfoModal from './components/InfoModal.svelte'
  import EASetupModal from './components/EASetupModal.svelte'
  import TwitchChat from './components/TwitchChat.svelte'

  // Derived states
  let isLoggedOut = $derived(!$user)
  let isSkating = $derived(!!lobbyStore.onlineUsers.find((u) => u.id === $user?.uid))

  let myRole = $state(''),
    currentEAUsername = $state(''),
    currentTags = $state([]),
    currentNote = $state('')

  let showInfoModal = $state(false),
    showEASetup = $state(false)

  onMount(() => {
    let unsubMe: (() => void) | null = null

    const unsubUser = user.subscribe((u) => {
      // FIX: Only clear the state if we are CERTAIN the user is gone.
      // If 'u' is null, wait a heartbeat or check if we're in the middle of a hosting transition.
      if (!u) {
        if (unsubMe) {
          unsubMe()
          unsubMe = null
        }
        return
      }

      // If we have a user, set up the real-time listener for their profile
      if (u.uid && !unsubMe) {
        unsubMe = onSnapshot(doc(db, 'users', u.uid), (snap) => {
          if (!snap.exists()) return // Prevent crashes on new accounts
          const data = snap.data() || {}
          myRole = data.role || ''
          currentEAUsername = data.eaUsername || ''
          currentTags = data.tags || []
          currentNote = data.note || ''
        })
      }
    })

    return () => {
      unsubUser()
      if (unsubMe) unsubMe()
    }
  })

  async function handleToggleRequest() {
    if (isLoggedOut || !$user) return

    const snap = await getDoc(doc(db, 'users', $user.uid))
    const userData = snap.data() || {}

    if (!isSkating) {
      if (!snap.exists() || !userData.eaUsername) {
        showEASetup = true
        return
      }
    }

    lobbyStore.setHosting($user.uid, !isSkating, {
      name: $user.displayName,
      avatar: $user.photoURL,
      eaUsername: userData.eaUsername || currentEAUsername,
      role: myRole || 'user'
    })
  }

  // Custom logout handler to ensure unhosting happens before signout
  async function handleLogout() {
    if (isSkating && $user?.uid) {
      await lobbyStore.setHosting($user.uid, false)
    }
    logout()
  }
</script>

<div class="h-screen flex flex-col bg-base-300 text-base-content overflow-hidden">
  <header class="navbar shrink-0 px-6 border-b border-white/5 bg-base-200/50 backdrop-blur">
    <div class="flex-1">
      <div class="flex flex-col">
        <h1 class="text-2xl font-black italic tracking-tighter uppercase">The Swarm</h1>
        <p class="text-[10px] uppercase opacity-40 font-bold tracking-[0.2em]">Live Lobby System</p>
      </div>
    </div>

    <div class="flex-none gap-4">
      {#if $user}
        <div
          class="flex items-center gap-3 bg-base-100 px-3 py-1.5 rounded-full border border-white/5"
        >
          <div class="w-2 h-2 rounded-full bg-success"></div>
          <span class="text-[10px] font-bold uppercase tracking-widest">{$user.displayName}</span>
          <button onclick={handleLogout} class="btn btn-ghost btn-xs uppercase font-bold text-error"
            >Sign Out</button
          >
        </div>
      {:else}
        <button
          onclick={login}
          class="btn btn-primary btn-sm px-4 italic font-black uppercase gap-2"
        >
          Twitch Login
        </button>
      {/if}
    </div>
  </header>

  <div class="flex-1 flex overflow-hidden">
    <aside
      class="relative z-10 w-[350px] border-r border-white/5 bg-base-300 flex flex-col shrink-0"
    >
      <div class="p-4 border-b border-white/5 flex items-center justify-between bg-base-200/50">
        <h2 class="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Live Comms</h2>
        <span class="badge badge-secondary badge-outline text-[9px] font-bold">TWITCH</span>
      </div>
      <div class="flex-1 bg-black">
        <TwitchChat channel="stillmilky" />
      </div>
    </aside>

    <main class="flex-1 flex flex-col overflow-y-auto bg-base-100">
      <div class="p-6 space-y-4 max-w-5xl mx-auto w-full">
        <section class="flex flex-col gap-4">
          {#if isLoggedOut}
            <div class="alert bg-base-200 border-white/5 rounded-xl flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="stroke-info shrink-0 w-6 h-6"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path></svg
              >
              <span class="text-[10px] font-black uppercase tracking-widest opacity-70 italic">
                Twitch Login required to host sessions
              </span>
            </div>
          {/if}

          <div class={isLoggedOut ? 'opacity-40 pointer-events-none' : ''}>
            <ControlBar
              {isSkating}
              currentUser={$user}
              onToggle={handleToggleRequest}
              onOpenInfo={() => (showInfoModal = true)}
            />
          </div>
        </section>

        <section class="flex-1">
          <div class="flex items-center gap-4 mb-4">
            <h2 class="text-[11px] font-black uppercase tracking-[0.3em]">Available Sessions</h2>
            <div class="h-px flex-1 bg-white/5"></div>
            <span class="badge badge-neutral badge-sm font-mono opacity-50 uppercase text-[9px]"
              >{lobbyStore.onlineUsers.length} active</span
            >
          </div>

          {#if lobbyStore.loading}
            <div class="py-20 flex justify-center opacity-10">
              <span class="loading loading-spinner loading-lg"></span>
            </div>
          {:else}
            <HostList
              onlineUsers={lobbyStore.onlineUsers}
              currentUserId={$user?.uid}
              currentUserRole={myRole}
              onEdit={() => (showEASetup = true)}
              onBoot={(id) => lobbyStore.setHosting(id, false)}
            />
          {/if}
        </section>
      </div>
    </main>
  </div>

  <InfoModal bind:show={showInfoModal} />

  <EASetupModal
    bind:show={showEASetup}
    currentName={currentEAUsername}
    {currentTags}
    {currentNote}
    onSave={async (data) => {
      const profileData = {
        eaUsername: data.username,
        tags: data.tags, // Array of max 3 strings
        note: data.note
      }
      await setDoc(doc(db, 'users', $user.uid), profileData, { merge: true })

      lobbyStore.setHosting($user.uid, true, {
        name: $user.displayName,
        avatar: $user.photoURL,
        eaUsername: data.username,
        role: myRole || 'user',
        tags: data.tags // Ensure these are passed to the lobby
      })
      showEASetup = false
    }}
  />
</div>
