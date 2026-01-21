<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  // Svelte 5 Props
  let {
    onlineUsers = [],
    currentUserId,
    currentUserRole,
    onBoot
  } = $props<{
    onlineUsers: any[]
    currentUserId?: string
    currentUserRole?: string
    onBoot: (id: string) => void
  }>()

  // 1. Live Timer Logic
  let now = $state(Date.now())
  let interval: any

  onMount(() => {
    interval = setInterval(() => {
      now = Date.now()
    }, 60000)
  })

  onDestroy(() => clearInterval(interval))

  // 2. Stable Sorting (Role > Prestige > ID Tie-breaker)
  const sortedUsers = $derived.by(() => {
    return [...onlineUsers].sort((a, b) => {
      const priority: Record<string, number> = {
        admin: 0,
        host: 1,
        creator: 2,
        member: 3
      }
      const roleA = priority[a.role] ?? 99
      const roleB = priority[b.role] ?? 99

      if (roleA !== roleB) return roleA - roleB

      const timeA = a.startedAt?.toMillis?.() || a.startedAt || now
      const timeB = b.startedAt?.toMillis?.() || b.startedAt || now

      // Sort oldest (smallest timestamp) to the top
      if (timeA !== timeB) return timeA - timeB

      // Tie-breaker 2: Alphabetical UID (Stops the heartbeat jumping)
      return a.id.localeCompare(b.id)
    })
  })

  // 3. Session Time Helper
  const getSessionTime = (startedAt: any) => {
    if (!startedAt) return 'LIVE'
    const start = startedAt.toMillis?.() || startedAt
    const diffMs = now - start
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}m`
    return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`
  }

  let copiedId = $state<string | null>(null)

  async function handleCopy(id: string) {
    if (!id || id === 'NO EA ID') return
    await navigator.clipboard.writeText(id)
    copiedId = id
    setTimeout(() => (copiedId = null), 2000)
  }

  const getFlair = (role: string = 'member') => {
    switch (role) {
      case 'admin':
        return {
          label: 'MILKY',
          cardClass: 'border-warning/30 bg-warning/5',
          textClass: 'text-warning',
          ringClass: 'ring-warning'
        }
      case 'host':
        return {
          label: 'MEGASERVER HOST',
          cardClass: 'border-info/30 bg-info/5',
          textClass: 'text-info',
          ringClass: 'ring-info'
        }
      case 'creator':
        return {
          label: 'CREATOR',
          cardClass: 'border-secondary/30 bg-secondary/5',
          textClass: 'text-secondary',
          ringClass: 'ring-secondary'
        }
      default:
        return {
          label: null,
          cardClass: 'border-white/10 bg-white/5',
          textClass: 'text-white',
          ringClass: 'ring-white/20'
        }
    }
  }
</script>

<div class="flex flex-col gap-2.5 w-full pb-10">
  {#if sortedUsers.length === 0}
    <div
      class="py-12 border border-dashed border-white/5 rounded-2xl flex items-center justify-center opacity-20"
    >
      <p class="text-base font-black uppercase tracking-[0.3em] italic text-white">
        No active sessions
      </p>
    </div>
  {:else}
    {#each sortedUsers as user (user.id)}
      {@const flair = getFlair(user.role)}

      <div
        class="border-2 rounded-3xl p-4 transition-all group relative overflow-hidden {flair.cardClass} shadow-xl hover:border-white/20"
      >
        <div class="absolute top-4 right-4 flex items-center gap-1.5 opacity-40">
          <div class="w-1 h-1 rounded-full bg-current animate-pulse"></div>
          <span class="text-[9px] font-black tracking-widest uppercase italic">
            {getSessionTime(user.startedAt)}
          </span>
        </div>

        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <img
              src={user.avatar || user.photoURL}
              alt=""
              class="w-8 h-8 rounded-lg bg-base-300 border-2 {flair.ringClass} shadow-md object-cover"
            />
            <div class="flex flex-col">
              {#if flair.label}
                <span
                  class="text-[8px] font-black {flair.textClass} uppercase tracking-widest leading-none mb-0.5"
                >
                  {flair.label}
                </span>
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
            class="font-black uppercase italic text-xl tracking-tighter leading-none {flair.textClass} truncate pr-1"
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
                stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg
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
                ><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                ></path></svg
              >
            {/if}
          </button>
        </div>

        {#if user.tags && user.tags.length > 0}
          <div class="flex flex-wrap gap-1 mb-2.5">
            {#each user.tags as tag (tag)}
              <span
                class="bg-black/40 text-white/40 text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-white/5"
              >
                {tag}
              </span>
            {/each}
          </div>
        {/if}

        {#if user.note}
          <div class="w-full bg-black/40 border-l-2 {flair.textClass} p-2 rounded-r-lg">
            <p class="text-xs font-medium italic text-white/80 leading-snug">
              "{user.note}"
            </p>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
