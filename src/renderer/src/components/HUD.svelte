<script lang="ts">
  import { user } from '$lib/stores/user'
  import { lobbyStore } from '$lib/stores/lobby.svelte'
  import HostListMobile from './HostListMobile.svelte'

  let { onlineCount } = $props()

  // --- Dynamic Island Logic ---
  let lastCount = $state(onlineCount)
  let isPulsing = $state(false)

  $effect(() => {
    if (onlineCount > lastCount) {
      isPulsing = true
      setTimeout(() => (isPulsing = false), 3000)
    }
    lastCount = onlineCount
  })

  // Calculate Signal
  let signalWidth = $derived(Math.min(onlineCount * 20 + 20, 100))

  let time = $state(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  setInterval(() => {
    time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }, 1000)
</script>

<div
  data-theme="dark"
  class="h-[850px] w-[400px] flex flex-col bg-black border-[6px] border-[#1a1a1a] rounded-[60px] shadow-2xl overflow-hidden relative ring-1 ring-white/10 z-[9999]"
>
  <div class="h-12 w-full flex items-center justify-between px-10 pt-4 shrink-0 z-50">
    <span class="text-xs font-bold text-white/90">{time}</span>

    <div
      class="absolute left-1/2 -translate-x-1/2 top-3 h-7 bg-black rounded-full border border-white/5 flex items-center justify-center gap-2 transition-all duration-500 ease-in-out z-[60]"
      style="width: {isPulsing ? '150px' : '110px'}; border-color: {isPulsing
        ? 'var(--p)'
        : 'rgba(255,255,255,0.05)'}"
    >
      <div
        class="w-1.5 h-1.5 bg-primary rounded-full {isPulsing ? 'animate-ping' : 'animate-pulse'}"
      ></div>
      <span
        class="text-[8px] font-black text-primary tracking-tighter uppercase whitespace-nowrap transition-all"
        style="letter-spacing: {isPulsing ? '-0.02em' : '0.05em'};"
      >
        {isPulsing ? 'HOST FOUND' : 'Swarm Live'}
      </span>
    </div>

    <div class="flex items-center gap-1.5 text-white/90">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="opacity-80">
        <rect x="2" y="14" width="3" height="6" fill={onlineCount >= 0 ? 'currentColor' : 'gray'} />
        <rect
          x="7"
          y="10"
          width="3"
          height="10"
          fill={onlineCount >= 2 ? 'currentColor' : 'gray'}
          opacity={onlineCount >= 2 ? '1' : '0.2'}
        />
        <rect
          x="12"
          y="6"
          width="3"
          height="14"
          fill={onlineCount >= 5 ? 'currentColor' : 'gray'}
          opacity={onlineCount >= 5 ? '1' : '0.2'}
        />
        <rect
          x="17"
          y="2"
          width="3"
          height="18"
          fill={onlineCount >= 10 ? 'currentColor' : 'gray'}
          opacity={onlineCount >= 10 ? '1' : '0.2'}
        />
      </svg>
      <div class="w-5 h-2.5 border border-white/30 rounded-sm relative">
        <div
          class="absolute left-0 top-0 h-full bg-white/80 transition-all duration-1000"
          style="width: {signalWidth}%"
        ></div>
      </div>
    </div>
  </div>

  <header class="px-8 pt-6 pb-2 shrink-0">
    <div class="flex items-baseline gap-2">
      <h1 class="text-4xl font-black italic uppercase tracking-tighter text-white">Swarm</h1>
      <span class="text-primary font-black italic">OS</span>
    </div>
    <p class="text-[10px] uppercase opacity-40 font-bold tracking-[0.2em] mt-1">
      Found {onlineCount} Sessions Near You
    </p>
  </header>

  <div class="flex-1 overflow-y-auto custom-scrollbar px-4 pt-2 pb-60 pointer-events-auto">
    <HostListMobile
      onlineUsers={lobbyStore.onlineUsers || []}
      currentUserId={$user?.uid}
      currentUserRole={$user?.role}
      onEdit={() => {}}
      onBoot={(id) => {
        console.log('Booting', id)
      }}
    />
  </div>

  <div
    class="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-full"
  ></div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 0px;
  }
  div[data-theme='dark'] {
    background: radial-gradient(circle at top right, #1a1a1a, #000);
  }
</style>
