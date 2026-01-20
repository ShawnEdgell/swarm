<script lang="ts">
  import { onMount } from 'svelte'
  import { user, login } from '$lib/stores/user'
  import { lobbyStore } from '$lib/stores/lobby.svelte'

  import Navbar from './Navbar.svelte'
  import ControlBar from './ControlBar.svelte'
  import LobbyManager from './LobbyManager.svelte'
  import Sidebar from './Sidebar.svelte'
  import InfoModal from './InfoModal.svelte'
  import EASetupModal from './EASetupModal.svelte'

  // Local UI State
  let chatIsOpen = $state(true)
  let showInfoModal = $state(false)
  let showEASetup = $state(false)

  let isSkating = $derived(!!lobbyStore.onlineUsers.find((u) => u.uid === $user?.uid))

  onMount(() => {
    const savedChatState = localStorage.getItem('swarm_chat_open')
    if (savedChatState !== null) chatIsOpen = JSON.parse(savedChatState)
  })

  $effect(() => {
    localStorage.setItem('swarm_chat_open', JSON.stringify(chatIsOpen))
  })

  async function handleToggleRequest() {
    if (!$user) return login()
    if (!isSkating && !$user.eaUsername) return (showEASetup = true)
    await lobbyStore.toggleHosting($user, isSkating)
  }
</script>

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
