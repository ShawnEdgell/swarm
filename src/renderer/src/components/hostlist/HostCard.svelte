<script lang="ts">
  import { getFlair, getSessionTime } from '$lib/utils/hostHelpers'

  let { user, now, isMobile = false, currentUserId, currentUserRole, onEdit, onBoot } = $props()

  const flair = $derived(getFlair(user.role))
  const timeStr = $derived(getSessionTime(user.startedAt, now))

  const colorMap = {
    warning: 'text-warning',
    info: 'text-info',
    secondary: 'text-secondary',
    white: 'text-white'
  }
  const accentColor = $derived(colorMap[flair.color as keyof typeof colorMap] || 'text-white')

  let copiedId = $state<string | null>(null)
  async function handleCopy(id: string) {
    if (!id || id === 'NO EA ID') return
    await navigator.clipboard.writeText(id)
    copiedId = id
    setTimeout(() => (copiedId = null), 2000)
  }
</script>

{#if isMobile}
  <div
    class="bg-white/5 hover:bg-white-[0.07] rounded-3xl p-4 transition-all group relative overflow-hidden shadow-xl"
  >
    <div class="absolute top-4 right-4 flex items-center gap-1.5 opacity-40">
      <div class="w-1 h-1 rounded-full bg-current animate-pulse"></div>
      <span class="text-xs font-black uppercase italic">{timeStr}</span>
    </div>

    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-3">
        <img
          src={user.avatar || user.photoURL}
          alt=""
          class="w-10 h-10 rounded-xl bg-base-300 border border-white/10 shadow-md object-cover"
        />
        <div class="flex flex-col justify-center">
          {#if flair.label}
            <span
              class="text-[10px] font-black uppercase tracking-[0.15em] leading-none mb-1 {accentColor}"
            >
              {flair.label}
            </span>
          {/if}
          <span class="text-xs font-black uppercase italic text-white tracking-wider">
            {user.name || user.displayName || 'Skater'}
          </span>
        </div>
      </div>

      {#if currentUserRole === 'admin' && user.id !== currentUserId}
        <button
          onclick={() => onBoot(user.id)}
          class="text-[9px] uppercase font-black italic text-error bg-white/5 px-2.5 py-1 rounded-full hover:bg-error/20 relative z-10 transition-colors"
        >
          Boot
        </button>
      {/if}
    </div>

    <div class="flex items-center gap-2.5 mb-2.5">
      <h3
        class="font-black uppercase italic text-xl tracking-tighter leading-none truncate pr-1 {accentColor}"
      >
        {user.eaUsername || 'NO EA ID'}
      </h3>
      <button
        onclick={() => handleCopy(user.eaUsername)}
        class="btn btn-ghost btn-xs btn-circle h-6 w-6 bg-white/5 hover:bg-primary border border-white/10 relative z-10"
      >
        {#if copiedId === user.eaUsername}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="text-success"><polyline points="20 6 9 17 4 12"></polyline></svg
          >
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="opacity-40"
            ><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path
              d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
            ></path></svg
          >
        {/if}
      </button>
    </div>

    {#if user.tags?.length > 0}
      <div class="flex flex-wrap gap-1 mb-2.5">
        {#each user.tags as tag (tag)}
          <span
            class="bg-black/30 text-white/40 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-white/5"
            >{tag}</span
          >
        {/each}
      </div>
    {/if}

    {#if user.note}
      <div class="w-full bg-black/20 border-l-2 border-white/10 p-2 rounded-r-lg">
        <p class="text-xs font-medium italic text-white/60 leading-snug">"{user.note}"</p>
      </div>
    {/if}
  </div>
{:else}
  <div
    class="bg-white/5 hover:bg-white-[0.07] rounded-2xl p-5 transition-all group relative overflow-visible shadow-xl"
  >
    <div class="absolute -top-3 left-6 z-20">
      <span
        class="rounded-md border border-white/10 bg-neutral-900 px-3 py-1 text-[10px] font-black tracking-widest text-white/60 italic shadow-xl uppercase"
      >
        {timeStr}
      </span>
    </div>

    {#if user.platform === 'desktop'}
      <div class="absolute -top-3 right-6 z-20">
        <span
          class="rounded-md border border-white/10 bg-primary px-3 py-1 text-[9px] font-black tracking-wider text-primary-content italic shadow-xl"
        >
          SWARM APP
        </span>
      </div>
    {/if}

    <div class="flex items-center justify-between gap-6">
      <div class="flex-1 min-w-0 space-y-2">
        <div class="flex items-center gap-3">
          <h3
            class="font-black uppercase italic text-2xl tracking-tighter leading-none truncate pr-2 {accentColor}"
          >
            {user.eaUsername || 'NO EA ID'}
          </h3>
          <button
            onclick={() => handleCopy(user.eaUsername)}
            class="btn btn-ghost btn-xs btn-circle bg-white/5 hover:bg-primary border border-white/10 shrink-0 transition-all"
          >
            {#if copiedId === user.eaUsername}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-success"><polyline points="20 6 9 17 4 12"></polyline></svg
              >
            {:else}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="opacity-40"
                ><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                ></path></svg
              >
            {/if}
          </button>
        </div>

        {#if user.tags?.length > 0}
          <div class="flex flex-wrap gap-1">
            {#each user.tags as tag (tag)}
              <span
                class="bg-black/30 text-white/40 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/5"
                >{tag}</span
              >
            {/each}
          </div>
        {/if}

        {#if user.note}
          <p class="text-sm font-medium italic text-white/40 leading-snug max-w-xl">
            "{user.note}"
          </p>
        {/if}
      </div>

      <div class="flex items-center gap-4 shrink-0 py-1">
        <div class="text-right flex flex-col items-end justify-center">
          {#if flair.label}
            <span
              class="text-[11px] font-black uppercase tracking-[0.2em] mb-1 {accentColor} leading-none"
            >
              {flair.label}
            </span>
          {/if}
          <span
            class="text-sm font-black uppercase italic text-white tracking-widest mb-2 leading-none"
          >
            {user.name || user.displayName || 'Skater'}
          </span>
          {#if user.id === currentUserId || currentUserRole === 'admin'}
            <button
              onclick={user.id === currentUserId ? onEdit : () => onBoot(user.id)}
              class="text-[10px] btn btn-xs h-auto min-h-0 uppercase font-black italic {user.id ===
              currentUserId
                ? 'text-warning'
                : 'text-error'} bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              {user.id === currentUserId ? 'Edit' : 'Boot'}
            </button>
          {/if}
        </div>
        <img
          src={user.avatar || user.photoURL}
          alt=""
          class="w-14 h-14 rounded-2xl bg-base-300 border border-white/10 shadow-lg object-cover"
        />
      </div>
    </div>
  </div>
{/if}
