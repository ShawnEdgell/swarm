<script lang="ts">
  import { user } from '$lib/stores/user'
  import { lobbyStore } from '$lib/stores/lobby.svelte'
  import HostList from './HostList.svelte'

  let { onEditEASetup } = $props<{ onEditEASetup: () => void }>()
</script>

<section class="flex-1">
  <div class="flex items-center gap-4 mb-4">
    <h2 class="text-[11px] font-black uppercase tracking-[0.3em]">Available Sessions</h2>
    <div class="h-px flex-1 bg-white/5"></div>
    <span class="badge badge-neutral badge-sm font-mono opacity-50 uppercase text-[9px]">
      {lobbyStore.onlineUsers.length} active
    </span>
  </div>

  {#if lobbyStore.loading}
    <div class="flex flex-col items-center justify-center py-20 opacity-20">
      <span class="loading loading-spinner loading-lg mb-4"></span>
      <p class="text-[10px] uppercase tracking-widest font-bold">Syncing Swarm...</p>
    </div>
  {:else}
    <HostList
      onlineUsers={lobbyStore.onlineUsers}
      currentUserId={$user?.uid}
      currentUserRole={$user?.role}
      onEdit={onEditEASetup}
      onBoot={(id) => lobbyStore.setHosting(id, false)}
    />
  {/if}
</section>
