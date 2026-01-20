<script lang="ts">
  import { onMount } from 'svelte'
  import { user } from '$lib/stores/user'
  import { lobbyStore } from '$lib/stores/lobby.svelte'
  import HostListMobile from './HostListMobile.svelte'

  let { onlineCount } = $props()

  // FIX: Initialize to 0 to silence the Svelte warning.
  // The onMount logic below already handles the sync before notifications start.
  let lastCount = $state(0)

  let ready = $state(false)

  // --- SINGLETON GUARD ---
  // 1. Check if we are the Overlay Window
  const isOverlay = window.location.hash.includes('overlay')

  // 2. Check if another HUD instance already claimed the "Notification Manager" role
  //    (Cast to 'any' to bypass TS check for custom property)
  const amINotificationManager = isOverlay && !(window as any).__SWARM_NOTIFIER_ACTIVE__

  onMount(() => {
    // If we are the chosen manager, claim the flag so duplicates back off
    if (amINotificationManager) {
      ;(window as any).__SWARM_NOTIFIER_ACTIVE__ = true
    }

    setTimeout(() => {
      ready = true
      lastCount = onlineCount
    }, 2000)
  })

  $effect(() => {
    if (ready && isOverlay && amINotificationManager) {
      const diff = onlineCount - lastCount

      if (diff !== 0) {
        if (diff > 0) {
          // ADD 'tag' HERE
          new Notification('Swarm Intelligence', {
            body: `⚠️ New Host Detected! (${onlineCount} Active)`,
            silent: false,
            tag: 'swarm-event' // <--- This tells Windows: "If this ID exists, replace it, don't stack it"
          })
          triggerPulse()
        } else {
          // ADD 'tag' HERE
          new Notification('Swarm Intelligence', {
            body: `Host Lost. (${onlineCount} Remaining)`,
            silent: true,
            tag: 'swarm-event' // <--- Same tag means it overwrites the previous one
          })
        }
      }
    }
    lastCount = onlineCount
  })

  // --- VISUALS ---
  // Visuals run on ALL instances (so the UI always looks correct)
  let isPulsing = $state(false)

  function triggerPulse() {
    isPulsing = true
    setTimeout(() => (isPulsing = false), 3000)
  }

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
      >
        {isPulsing ? 'HOST FOUND' : 'Swarm Live'}
      </span>
    </div>
    <div class="flex items-center gap-1.5 text-white/90">
      <div class="flex items-end gap-[2px] h-3 mb-0.5">
        <div class="w-[3px] rounded-full bg-white/80" style="height: 30%"></div>
        <div class="w-[3px] rounded-full bg-white/80" style="height: 60%"></div>
        <div class="w-[3px] rounded-full bg-white/20" style="height: 100%"></div>
      </div>
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

  <div class="flex-1 overflow-y-auto custom-scrollbar px-4 pt-2 pb-8 pointer-events-auto">
    <HostListMobile
      onlineUsers={lobbyStore.onlineUsers || []}
      currentUserId={$user?.uid}
      currentUserRole={$user?.role}
      onEdit={() => {}}
      onBoot={(id) => console.log('Booting', id)}
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
