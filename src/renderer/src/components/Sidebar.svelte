<script lang="ts">
  import { onMount } from 'svelte'
  import TwitchChat from './TwitchChat.svelte'

  let { isOpen = $bindable() } = $props<{ isOpen: boolean }>()

  // Initialize from storage or default
  let activeChannel = $state('stillmilky')
  let isEditing = $state(false)
  let inputVal = $state('')

  onMount(() => {
    const saved = localStorage.getItem('swarm_chat_channel')
    if (saved) activeChannel = saved
    inputVal = activeChannel
  })

  function saveChannel() {
    if (inputVal.trim()) {
      activeChannel = inputVal.toLowerCase().trim()
      localStorage.setItem('swarm_chat_channel', activeChannel)
    }
    isEditing = false
  }
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
        <div class="flex flex-col flex-1">
          {#if isEditing}
            <div class="flex items-center gap-2">
              <input
                bind:value={inputVal}
                onkeydown={(e) => e.key === 'Enter' && saveChannel()}
                class="bg-black/60 border border-primary/30 rounded-lg px-2 py-1 text-[11px] text-white outline-none w-3/4 shadow-inner"
                placeholder="Channel ID..."
                autofocus
              />
            </div>
          {:else}
            <h2
              class="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1"
            >
              Twitch Channel
            </h2>
            <div class="flex items-center gap-2">
              <span class="text-[11px] font-black uppercase italic text-white tracking-tight">
                {activeChannel}
              </span>
              <button
                onclick={() => (isEditing = true)}
                class="text-[9px] hover:cursor-pointer font-black uppercase text-white/30 hover:text-primary transition-colors border border-white/10 px-1.5 py-0.5 rounded-md bg-white/5"
              >
                Change
              </button>
            </div>
          {/if}
        </div>

        <div class="flex items-center gap-2">
          {#if isEditing}
            <button
              onclick={saveChannel}
              class="btn btn-primary btn-xs italic font-black uppercase rounded-lg px-3"
            >
              Link
            </button>
          {/if}
          <button
            onclick={() => (isOpen = false)}
            class="btn btn-ghost btn-sm btn-circle hover:bg-white/10 text-white/40 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    {:else}
      <button
        onclick={() => (isOpen = true)}
        class="w-full h-full flex items-center justify-center hover:bg-white/10 transition-colors animate-in fade-in zoom-in duration-300 cursor-pointer"
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
      <TwitchChat channel={activeChannel} />
    </div>

    {#if !isOpen}
      <div class="absolute inset-0 flex flex-col items-center pt-8 opacity-20 pointer-events-none">
        <div class="w-1 h-32 bg-primary/20 rounded-full blur-sm"></div>
      </div>
    {/if}
  </div>
</aside>
