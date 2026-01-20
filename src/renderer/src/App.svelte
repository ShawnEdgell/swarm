<script lang="ts">
  import { onMount } from 'svelte'
  import { user, login } from '$lib/stores/user'
  import { lobbyStore } from '$lib/stores/lobby.svelte'

  import HUD from './components/HUD.svelte'
  import Navbar from './components/Navbar.svelte'
  import ControlBar from './components/ControlBar.svelte'
  import LobbyManager from './components/LobbyManager.svelte' // New Component
  import Sidebar from './components/Sidebar.svelte'
  import InfoModal from './components/InfoModal.svelte'
  import EASetupModal from './components/EASetupModal.svelte'

  // States
  let chatIsOpen = $state(true)
  let showInfoModal = $state(false)
  let showEASetup = $state(false)

  let isOverlay = $derived(window.location.hash.includes('overlay'))
  let isSkating = $derived(!!lobbyStore.onlineUsers.find((u) => u.uid === $user?.uid))

  onMount(() => {
    // Persistency Check
    const savedChatState = localStorage.getItem('swarm_chat_open')
    if (savedChatState !== null) chatIsOpen = JSON.parse(savedChatState)

    window.api?.onAppClosing?.(async () => {
      if ($user?.uid) await lobbyStore.setHosting($user.uid, false)
    })
  })

  $effect(() => {
    localStorage.setItem('swarm_chat_open', JSON.stringify(chatIsOpen))
  })

  async function handleToggleRequest() {
    if (!$user) return login()
    if (!isSkating && !$user.eaUsername) return (showEASetup = true)

    // Logic is now a simple store call
    await lobbyStore.toggleHosting($user, isSkating)
  }
</script>

{#if isOverlay}
  <HUD onlineCount={lobbyStore.onlineUsers.length} />
{:else}
  <div class="h-screen flex flex-col bg-base-300 text-base-content overflow-hidden font-sans">
    <Navbar />

    <div class="flex-1 flex overflow-hidden relative">
      <Sidebar bind:isOpen={chatIsOpen} channel="stillmilky" />

      <main class="flex-1 flex flex-col overflow-y-auto bg-base-100 relative">
        <div class="p-6 space-y-4 max-w-5xl mx-auto w-full">
          <ControlBar
            {isSkating}
            currentUser={$user}
            onToggle={handleToggleRequest}
            onOpenInfo={() => (showInfoModal = true)}
          />

          <LobbyManager onEditEASetup={() => (showEASetup = true)} />
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
        await lobbyStore.updateProfileAndHost($user.uid, data)
        showEASetup = false
      }}
    />
  </div>
{/if}
