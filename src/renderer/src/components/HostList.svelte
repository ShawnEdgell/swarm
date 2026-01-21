<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  let {
    onlineUsers = [],
    currentUserId,
    currentUserRole,
    onEdit,
    onBoot
  } = $props<{
    onlineUsers: any[]
    currentUserId?: string
    currentUserRole?: string
    onEdit: () => void
    onBoot: (id: string) => void
  }>()

  let now = $state(Date.now())
  let interval: any

  onMount(() => {
    interval = setInterval(() => {
      now = Date.now()
    }, 60000)
  })

  onDestroy(() => clearInterval(interval))

  const sortedUsers = $derived.by(() => {
    return [...onlineUsers].sort((a, b) => {
      const priority: Record<string, number> = { admin: 0, host: 1, creator: 2, member: 3 }
      const roleA = priority[a.role] ?? 99
      const roleB = priority[b.role] ?? 99

      if (roleA !== roleB) return roleA - roleB

      // Penalty fallback: No timestamp = treated as 'now' (bottom of tier)
      const timeA = a.startedAt?.toMillis?.() || a.startedAt || now
      const timeB = b.startedAt?.toMillis?.() || b.startedAt || now

      if (timeA !== timeB) return timeA - timeB
      return a.id.localeCompare(b.id)
    })
  })

  const getSessionTime = (startedAt: any) => {
    if (!startedAt) return 'LIVE'
    const start = startedAt.toMillis?.() || startedAt
    const diffMs = now - start
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}m`
    const hrs = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hrs}h ${mins}m`
  }

  let copiedId = $state<string | null>(null)
  async function handleCopy(id: string) {
    if (!id) return
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
          ringClass: 'ring-warning/50'
        }
      case 'host':
        return {
          label: 'MEGASERVER HOST',
          cardClass: 'border-info/30 bg-info/5',
          textClass: 'text-info',
          ringClass: 'ring-info/50'
        }
      case 'creator':
        return {
          label: 'CREATOR',
          cardClass: 'border-secondary/30 bg-secondary/5',
          textClass: 'text-secondary',
          ringClass: 'ring-secondary/50'
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

<div class="flex flex-col gap-3 w-full pb-10">
  {#if sortedUsers.length === 0}
    <div
      class="py-12 border border-dashed border-white/5 rounded-3xl flex items-center justify-center opacity-20"
    >
      <p class="text-base font-black uppercase tracking-[0.3em] italic text-white">
        No active sessions
      </p>
    </div>
  {:else}
    {#each sortedUsers as user (user.id)}
      {@const flair = getFlair(user.role)}
      <div
        class="border-2 rounded-2xl p-5 transition-all group relative overflow-visible {flair.cardClass} shadow-xl hover:border-white/20"
      >
        <div class="absolute -top-3 left-6 z-20">
          <span
            class="rounded-md border border-white/10 bg-neutral-800 px-3 py-1 text-[9px] font-black tracking-widest text-white/60 italic shadow-xl"
          >
            {getSessionTime(user.startedAt)}
          </span>
        </div>

        {#if user.platform === 'desktop'}
          <div class="absolute -top-3 right-6 z-20">
            <span
              class="rounded-md border border-white/10 bg-primary px-3 py-1 text-[9px] font-black tracking-wider text-primary-content italic shadow-[0_0_15px_rgba(var(--p),0.4)]"
            >
              SWARM APP
            </span>
          </div>
        {/if}

        <div class="flex items-center justify-between gap-6">
          <div class="flex-1 min-w-0 space-y-2">
            <div class="flex items-center gap-3">
              <h3
                class="font-black uppercase italic text-2xl tracking-tighter leading-none {flair.textClass} truncate pr-2"
              >
                {user.eaUsername || 'NO EA ID'}
              </h3>
              <button
                onclick={() => handleCopy(user.eaUsername)}
                class="btn btn-ghost btn-xs btn-circle bg-white/5 hover:bg-primary hover:text-primary-content border border-white/10 shrink-0 transition-all"
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
              <p class="text-sm font-medium italic text-white/60 leading-snug max-w-xl">
                "{user.note}"
              </p>
            {/if}
          </div>

          <div class="flex items-center gap-3 shrink-0 py-1">
            <div class="text-right flex flex-col items-end">
              {#if flair.label}
                <span
                  class="text-[8px] font-black {flair.textClass} uppercase tracking-widest leading-none mb-1"
                  >{flair.label}</span
                >
              {/if}
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
              class="w-11 h-11 rounded-xl bg-base-300 border-2 {flair.ringClass} shadow-lg object-cover"
            />
          </div>
        </div>
      </div>
    {/each}
  {/if}
</div>
