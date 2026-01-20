<script lang="ts">
  let { isSkating, currentUser, onToggle, onOpenInfo } = $props<{
    isSkating: boolean
    currentUser: any
    onToggle: () => void
    onOpenInfo: () => void
  }>()
</script>

<div
  class="flex items-center justify-between bg-base-200 p-4 rounded-xl border border-white/5 shadow-lg w-full"
>
  <div class="flex items-center gap-4">
    {#if currentUser}
      <div class="avatar {isSkating ? 'online' : ''}">
        <div
          class="w-12 rounded-lg ring ring-primary ring-offset-base-100 ring-offset-2 bg-base-300"
        >
          <img src={currentUser.avatar} alt="Profile" />
        </div>
      </div>

      <div class="flex items-center gap-4 border-l border-white/10 pl-4">
        <div>
          <p class="text-[10px] font-bold text-primary uppercase leading-none mb-1 tracking-widest">
            Operator
          </p>
          <p class="text-lg font-black italic uppercase leading-none tracking-tighter">
            {currentUser.name}
          </p>
        </div>
      </div>
    {:else}
      <div class="flex items-center gap-3">
        <div
          class="w-12 h-12 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center"
        >
          <span class="opacity-20">?</span>
        </div>
        <div class="space-y-1">
          <div class="h-2 w-12 bg-white/10 rounded"></div>
          <p class="text-[10px] font-bold text-white/20 uppercase tracking-widest">
            Awaiting Login
          </p>
        </div>
      </div>
    {/if}
  </div>

  <div class="flex items-center gap-2">
    <button
      onclick={onOpenInfo}
      type="button"
      class="btn btn-ghost btn-circle btn-sm bg-white/5 hover:bg-white/10 border border-white/5 text-white/50 hover:text-white transition-all"
      aria-label="App Information"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
      </svg>
    </button>

    <div class={!currentUser ? 'tooltip tooltip-left' : ''} data-tip="Login with Twitch to Host">
      <button
        onclick={onToggle}
        type="button"
        disabled={!currentUser}
        class="btn btn-sm {isSkating
          ? 'btn-error shadow-[0_0_15px_rgba(239,68,68,0.2)]'
          : 'btn-primary shadow-[0_0_15px_rgba(var(--p),0.2)]'} 
          font-black uppercase italic px-6 disabled:bg-white/5 disabled:text-white/20 disabled:border-transparent"
      >
        {#if isSkating}
          Stop Hosting
        {:else}
          Start Hosting
        {/if}
      </button>
    </div>
  </div>
</div>
