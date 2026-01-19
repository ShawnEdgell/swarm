<script lang="ts">
  import { onMount } from 'svelte'
  import { user, login } from '$lib/stores/user'
  import { lobbyStore } from '$lib/stores/lobby.svelte'
  import { db } from '$lib/firebase'
  import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

  import HUD from './components/HUD.svelte'
  import Navbar from './components/Navbar.svelte'
  import ControlBar from './components/ControlBar.svelte'
  import HostList from './components/HostList.svelte'
  import InfoModal from './components/InfoModal.svelte'
  import EASetupModal from './components/EASetupModal.svelte'
  import TwitchChat from './components/TwitchChat.svelte'

  let isOverlay = $derived(window.location.hash.includes('overlay'))
  let isSkating = $derived(!!lobbyStore.onlineUsers.find((u) => u.uid === $user?.uid))
  let showInfoModal = $state(false),
    showEASetup = $state(false)

  onMount(() => {
    window.api?.onAppClosing?.(async () => {
      if ($user?.uid) await lobbyStore.setHosting($user.uid, false)
    })
  })

  async function handleToggleRequest() {
    if (!$user) return login()
    if (!isSkating && !$user.eaUsername) return (showEASetup = true)

    await lobbyStore.setHosting($user.uid, !isSkating, {
      ...$user,
      displayName: $user.name,
      photoURL: $user.avatar,
      platform: 'desktop'
    })
  }
</script>

{#if isOverlay}
  <HUD onlineCount={lobbyStore.onlineUsers.length} />
{:else}
  <div class="h-screen flex flex-col bg-base-300 text-base-content overflow-hidden font-sans">
    <Navbar />

    <div class="flex-1 flex overflow-hidden">
      <aside class="w-[350px] border-r border-white/5 bg-base-300 flex flex-col shrink-0">
        <div class="p-4 border-b border-white/5 flex items-center justify-between bg-base-200/50">
          <h2 class="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Live Comms</h2>
          <span class="badge badge-secondary badge-outline text-[9px] font-bold italic">TWITCH</span
          >
        </div>
        <div class="flex-1 bg-black">
          <TwitchChat channel="stillmilky" />
        </div>
      </aside>

      <main class="flex-1 flex flex-col overflow-y-auto bg-base-100">
        <div class="p-6 space-y-4 max-w-5xl mx-auto w-full">
          <ControlBar
            {isSkating}
            currentUser={$user}
            onToggle={handleToggleRequest}
            onOpenInfo={() => (showInfoModal = true)}
          />

          <section class="flex-1">
            <div class="flex items-center gap-4 mb-4">
              <h2 class="text-[11px] font-black uppercase tracking-[0.3em]">Available Sessions</h2>
              <div class="h-px flex-1 bg-white/5"></div>
              <span class="badge badge-neutral badge-sm font-mono opacity-50 uppercase text-[9px]"
                >{lobbyStore.onlineUsers.length} active</span
              >
            </div>

            {#if lobbyStore.loading}
              <span class="loading loading-spinner loading-lg opacity-10 m-auto block py-20"></span>
            {:else}
              <HostList
                onlineUsers={lobbyStore.onlineUsers}
                currentUserId={$user?.uid}
                currentUserRole={$user?.role}
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
      currentName={$user?.eaUsername || ''}
      currentTags={$user?.tags || []}
      currentNote={$user?.note || ''}
      onSave={async (data) => {
        if (!$user) return
        const profile = {
          eaUsername: data.username,
          tags: data.tags,
          note: data.note,
          lastSeen: serverTimestamp()
        }
        await setDoc(doc(db, 'users', $user.uid), profile, { merge: true })
        await lobbyStore.setHosting($user.uid, true, { ...$user, ...profile, platform: 'desktop' })
        showEASetup = false
      }}
    />
  </div>
{/if}
