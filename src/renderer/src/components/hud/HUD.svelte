<script lang="ts">
  import { onMount } from 'svelte'
  import StatusBar from './StatusBar.svelte'
  import Navigation from './Navigation.svelte'
  import SessionsApp from './apps/SessionsApp.svelte'
  import ChatApp from './apps/ChatApp.svelte'

  let { onlineCount } = $props()

  // --- APP STATE ---
  let activeApp = $state('sessions')
  let chatChannel = $state('stillmilky')

  // --- SYSTEM LOGIC ---
  let lastCount = $state(onlineCount)
  let ready = $state(false)
  let isPulsing = $state(false)
  let time = $state(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  let signalWidth = $derived(Math.min(onlineCount * 20 + 20, 100))

  const isOverlay = window.location.hash.includes('overlay')
  const amINotificationManager = isOverlay && !(window as any).__SWARM_NOTIFIER_ACTIVE__

  onMount(() => {
    if (amINotificationManager) (window as any).__SWARM_NOTIFIER_ACTIVE__ = true

    const saved = localStorage.getItem('swarm_chat_channel')
    if (saved) chatChannel = saved

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'swarm_chat_channel' && e.newValue) chatChannel = e.newValue
    }
    window.addEventListener('storage', handleStorageChange)

    const clock = setInterval(() => {
      time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, 1000)

    setTimeout(() => {
      ready = true
      lastCount = onlineCount
    }, 2000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(clock)
    }
  })

  $effect(() => {
    if (ready && isOverlay && onlineCount > lastCount) {
      isPulsing = true
      setTimeout(() => (isPulsing = false), 3000)
    }
    lastCount = onlineCount
  })
</script>

<div
  data-theme="dark"
  class="h-[850px] w-[400px] flex flex-col bg-black border-[6px] border-[#1a1a1a] rounded-[60px] shadow-2xl overflow-hidden relative ring-1 ring-white/10 z-[9999]"
>
  <StatusBar {isPulsing} {signalWidth} {time} />

  <header class="px-8 pt-4 pb-2 shrink-0">
    <p class="text-[10px] uppercase opacity-40 font-bold tracking-[0.2em]">
      {activeApp === 'chat' ? `IRC: #${chatChannel}` : `Near You: ${onlineCount} Sessions`}
    </p>
  </header>

  <div class="flex-1 overflow-y-auto custom-scrollbar px-4 pt-2 pb-2 pointer-events-auto">
    {#if activeApp === 'chat'}
      <ChatApp channel={chatChannel} />
    {:else}
      <SessionsApp onBoot={(id) => console.log('Booting', id)} />
    {/if}
  </div>

  <Navigation bind:activeApp />

  <div class="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/10 rounded-full"></div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 0px;
  }
  div[data-theme='dark'] {
    background: radial-gradient(circle at top right, #1a1a1a, #000);
  }
</style>
