<script lang="ts">
  import { getFlair, getSessionTime } from '$lib/utils/hostHelpers'

  let { user, now, isMobile = false, currentUserId, currentUserRole, onEdit, onBoot } = $props()

  const flair = $derived(getFlair(user.role))
  const timeStr = $derived(getSessionTime(user.startedAt, now))

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
    class="border-2 rounded-3xl p-4 transition-all group relative overflow-hidden border-{flair.color}/30 bg-{flair.color}/5 shadow-xl hover:border-white/20"
  >
    <div class="absolute top-4 right-4 flex items-center gap-1.5 opacity-40">
      <div class="w-1 h-1 rounded-full bg-current animate-pulse"></div>
      <span class="text-[9px] font-black uppercase italic">{timeStr}</span>
    </div>

    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2.5">
        <img
          src={user.avatar || user.photoURL}
          alt=""
          class="w-8 h-8 rounded-lg bg-base-300 border-2 border-{flair.color}/50 shadow-md object-cover"
        />
        <div class="flex flex-col">
          {#if flair.label}
            <span
              class="text-[8px] font-black text-{flair.color} uppercase tracking-widest leading-none mb-0.5"
              >{flair.label}</span
            >
          {/if}
          <span class="text-[10px] font-black uppercase italic text-white/50 tracking-wider">
            {user.name || user.displayName || 'Skater'}
          </span>
        </div>
      </div>

      {#if currentUserRole === 'admin' && user.id !== currentUserId}
        <button
          onclick={() => onBoot(user.id)}
          class="text-[9px] uppercase font-black italic text-error bg-white/5 px-2.5 py-1 rounded-full hover:bg-white/10 relative z-10"
        >
          Boot
        </button>
      {/if}
    </div>

    <div class="flex items-center gap-2.5 mb-2.5">
      <h3
        class="font-black uppercase italic text-xl tracking-tighter leading-none text-{flair.color} truncate pr-1"
      >
        {user.eaUsername || 'NO EA ID'}
      </h3>

      <button
        onclick={() => handleCopy(user.eaUsername)}
        class="btn btn-ghost btn-xs btn-circle h-6 w-6 bg-white/5 hover:bg-primary hover:text-primary-content border border-white/10 relative z-10"
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
            class="bg-black/40 text-white/40 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-white/5"
            >{tag}</span
          >
        {/each}
      </div>
    {/if}

    {#if user.note}
      <div class="w-full bg-black/40 border-l-2 border-{flair.color} p-2 rounded-r-lg">
        <p class="text-xs font-medium italic text-white/80 leading-snug">"{user.note}"</p>
      </div>
    {/if}
  </div>
{:else}
  <div
    class="border-2 rounded-2xl p-5 transition-all group relative overflow-visible border-{flair.color}/30 bg-{flair.color}/5 shadow-xl hover:border-white/20"
  >
    <div class="absolute -top-3 left-6 z-20">
      <span
        class="rounded-md border border-white/10 bg-neutral-800 px-3 py-1 text-[9px] font-black tracking-widest text-white/60 italic shadow-xl"
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
            class="font-black uppercase italic text-2xl tracking-tighter leading-none text-{flair.color} truncate pr-2"
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
        {#if user.note}<p class="text-sm font-medium italic text-white/60 leading-snug max-w-xl">
            "{user.note}"
          </p>{/if}
      </div>

      <div class="flex items-center gap-3 shrink-0 py-1">
        <div class="text-right flex flex-col items-end">
          {#if flair.label}<span
              class="text-[8px] font-black text-{flair.color} uppercase tracking-widest mb-1"
              >{flair.label}</span
            >{/if}
          <span class="text-xs font-black uppercase italic text-white/80 tracking-wider mb-1.5"
            >{user.name || user.displayName || 'Skater'}</span
          >
          {#if user.id === currentUserId || currentUserRole === 'admin'}
            <button
              onclick={user.id === currentUserId ? onEdit : () => onBoot(user.id)}
              class="text-[10px] btn btn-xs h-auto min-h-0 uppercase font-black italic {user.id ===
              currentUserId
                ? 'text-warning'
                : 'text-error'} bg-white/5 px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              {user.id === currentUserId ? 'Edit' : 'Boot'}
            </button>
          {/if}
        </div>
        <img
          src={user.avatar || user.photoURL}
          alt=""
          class="w-11 h-11 rounded-xl bg-base-300 border-2 border-{flair.color}/50 shadow-lg object-cover"
        />
      </div>
    </div>
  </div>
{/if}
