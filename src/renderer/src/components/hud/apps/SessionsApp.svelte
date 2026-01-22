<script lang="ts">
  import HostList from '@renderer/components/hostlist/HostList.svelte'
  import { lobbyStore } from '$lib/stores/lobby.svelte'
  import { user } from '$lib/stores/user'

  let { onBoot } = $props<{ onBoot: (id: string) => void }>()
</script>

<HostList
  onlineUsers={lobbyStore.onlineUsers || []}
  currentUserId={$user?.uid}
  currentUserRole={$user?.role}
  {onBoot}
  isMobile={true}
/>
