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
        <div class="w-12 rounded-lg ring ring-primary ring-offset-base-100 ring-offset-2">
          <img src={currentUser.photoURL} alt="Profile" />
        </div>
      </div>

      <div class="flex items-center gap-4 border-l border-white/10 pl-4">
        <div>
          <p class="text-[10px] font-bold text-primary uppercase leading-none mb-1">Operator</p>
          <p class="text-lg font-black italic uppercase leading-none">{currentUser.displayName}</p>
        </div>
      </div>
    {:else}
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-white/5 rounded-lg"></div>
        <div class="h-3 w-24 bg-white/5 rounded"></div>
      </div>
    {/if}
  </div>

  <div class="flex items-center gap-2">
    <button onclick={onOpenInfo} type="button" class="btn btn-ghost btn-circle btn-sm">ⓘ</button>

    <button
      onclick={onToggle}
      type="button"
      class="btn btn-sm {isSkating ? 'btn-error' : 'btn-primary'} font-black uppercase italic"
    >
      {#if isSkating}
        Stop Hosting
      {:else}
        Start Hosting
      {/if}
    </button>
  </div>
</div>
