<script lang="ts">
  import { user } from '$lib/stores/user'
  import { lobbyStore } from '$lib/stores/lobby.svelte'
  import HostList from './HostList.svelte'

  let { onlineCount } = $props()
</script>

<div
  data-theme="dark"
  class="h-screen w-full p-4 overflow-hidden bg-neutral border border-white/10 rounded-2xl flex flex-col text-white"
>
  <div class="flex items-center justify-between mb-4 shrink-0 px-2">
    <div class="flex flex-col">
      <h1 class="text-lg font-black italic uppercase tracking-tighter text-primary leading-none">
        Swarm HUD
      </h1>
      <p class="text-[8px] uppercase opacity-50 font-bold tracking-widest mt-1">F8 to Toggle</p>
    </div>
    <div class="badge badge-primary badge-xs font-black italic">
      {onlineCount} <span>LIVE</span>
    </div>
  </div>

  <div class="flex-1 overflow-y-auto custom-scrollbar">
    <HostList
      onlineUsers={lobbyStore.onlineUsers}
      currentUserId={$user?.uid}
      currentUserRole={$user?.role}
      onEdit={() => {}}
      onBoot={() => {}}
    />
  </div>
</div>
