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
      <div class="flex items-center gap-3 opacity-20">
        <div class="w-12 h-12 bg-white/10 rounded-lg"></div>
        <div class="space-y-2">
          <div class="h-2 w-12 bg-white/10 rounded"></div>
          <div class="h-4 w-24 bg-white/10 rounded"></div>
        </div>
      </div>
    {/if}
  </div>

  <div class="flex items-center gap-2">
    <button
      onclick={onOpenInfo}
      type="button"
      class="btn btn-ghost btn-circle btn-sm opacity-50 hover:opacity-100">ⓘ</button
    >

    <button
      onclick={onToggle}
      type="button"
      class="btn btn-sm {isSkating
        ? 'btn-error shadow-[0_0_15px_rgba(239,68,68,0.2)]'
        : 'btn-primary shadow-[0_0_15px_rgba(var(--p),0.2)]'} font-black uppercase italic px-6"
    >
      {#if isSkating}
        Stop Hosting
      {:else}
        Start Hosting
      {/if}
    </button>
  </div>
</div>
