<script lang="ts">
  import { onMount } from 'svelte'
  import { user } from '$lib/stores/user'
  import { lobbyStore } from '$lib/stores/lobby.svelte'

  import HUD from './components//hud/HUD.svelte'
  import Dashboard from './components/Dashboard.svelte'
  import SystemNotifications from './components/SystemNotifications.svelte' // <--- IMPORT

  // Identify if we are in the overlay window
  let isOverlay = $derived(window.location.hash.includes('overlay'))

  onMount(() => {
    window.api?.onAppClosing?.(async () => {
      if ($user?.uid) await lobbyStore.setHosting($user.uid, false)
    })
  })
</script>

{#if isOverlay}
  <SystemNotifications />

  <HUD onlineCount={lobbyStore.onlineUsers.length} />
{:else}
  <Dashboard />
{/if}
