<script lang="ts">
  import { onMount } from 'svelte'
  import { lobbyStore } from '$lib/stores/lobby.svelte'

  // --- NOTIFICATION STATE ---
  let lastUsers: any[] = []
  let ready = $state(false)
  const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'

  // --- SINGLETON GUARD ---
  // Ensures only ONE component handles notifications (The Overlay Window)
  const isOverlay = window.location.hash.includes('overlay')
  const amINotificationManager = isOverlay && !(window as any).__SWARM_NOTIFIER_ACTIVE__

  onMount(() => {
    // If we are the chosen manager, claim the flag
    if (amINotificationManager) {
      ;(window as any).__SWARM_NOTIFIER_ACTIVE__ = true
    }

    lastUsers = [...lobbyStore.onlineUsers]
    setTimeout(() => {
      ready = true
    }, 2000)
  })

  $effect(() => {
    // Only run if Ready + Overlay + Manager
    if (ready && isOverlay && amINotificationManager) {
      const currentUsers = lobbyStore.onlineUsers
      const currentIds = currentUsers.map((u) => u.uid)
      const lastIds = lastUsers.map((u) => u.uid)

      // A. DETECT JOINERS
      for (const u of currentUsers) {
        if (!lastIds.includes(u.uid)) {
          const avatar = u.avatar || u.photoURL || DEFAULT_AVATAR
          const name = u.eaUsername || u.username || 'Unknown Skater'

          new Notification(`[Swarm] ${name}`, {
            body: 'Is now online',
            icon: avatar,
            silent: false,
            tag: `swarm-join-${u.uid}`
          })
        }
      }

      // B. DETECT LEAVERS
      for (const oldUser of lastUsers) {
        if (!currentIds.includes(oldUser.uid)) {
          const avatar = oldUser.avatar || oldUser.photoURL || DEFAULT_AVATAR
          const name = oldUser.eaUsername || oldUser.username || 'Unknown Skater'

          new Notification(`[Swarm] ${name}`, {
            body: 'Signed out',
            icon: avatar,
            silent: true,
            tag: 'swarm-leave'
          })
        }
      }
      lastUsers = [...currentUsers]
    } else if (!ready) {
      lastUsers = [...lobbyStore.onlineUsers]
    }
  })
</script>
