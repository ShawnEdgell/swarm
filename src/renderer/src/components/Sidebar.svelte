<script lang="ts">
  import TwitchChat from './TwitchChat.svelte'

  let { isOpen = $bindable(), channel = 'stillmilky' } = $props<{
    isOpen: boolean
    channel?: string
  }>()
</script>

<aside
  class="h-full bg-base-300 border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out relative z-40 shadow-2xl"
  style="width: {isOpen ? '350px' : '72px'};"
>
  <div class="h-[64px] border-b border-white/5 flex items-center bg-base-200/50 overflow-hidden">
    {#if isOpen}
      <div
        class="flex items-center justify-between w-full min-w-[310px] px-4 animate-in fade-in duration-500"
      >
        <div class="flex flex-col">
          <h2 class="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 leading-none">
            Live Comms
          </h2>
          <span class="text-[9px] text-primary font-bold mt-1 uppercase tracking-tighter"
            >Connected</span
          >
        </div>
        <button
          onclick={() => (isOpen = false)}
          class="btn btn-ghost btn-sm btn-circle hover:bg-white/10"
          title="Minimize Chat"
        >
          ✕
        </button>
      </div>
    {:else}
      <button
        onclick={() => (isOpen = true)}
        class="w-full h-full flex items-center justify-center hover:bg-white/10 transition-colors animate-in fade-in zoom-in duration-300 cursor-pointer"
        title="Expand Chat"
      >
        <span class="text-xl">💬</span>
      </button>
    {/if}
  </div>

  <div class="flex-1 bg-black/40 relative overflow-hidden">
    <div
      class="h-full transition-opacity duration-300"
      style="opacity: {isOpen ? '1' : '0'}; pointer-events: {isOpen
        ? 'auto'
        : 'none'}; min-w-[350px];"
    >
      <TwitchChat {channel} />
    </div>

    {#if !isOpen}
      <div class="absolute inset-0 flex flex-col items-center pt-8 opacity-20 pointer-events-none">
        <div class="w-1 h-32 bg-primary/20 rounded-full blur-sm"></div>
      </div>
    {/if}
  </div>
</aside>
