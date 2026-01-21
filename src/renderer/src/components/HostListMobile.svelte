<script lang="ts">
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
          label: 'OFFICIAL HOST',
          cardClass: 'border-info/30 bg-info/5',
          textClass: 'text-info',
          ringClass: 'ring-info'
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
  {#if onlineUsers.length === 0}
    <div
      class="py-12 border border-dashed border-white/5 rounded-2xl flex items-center justify-center opacity-20"
    >
      <p class="text-base font-black uppercase tracking-[0.3em] italic text-white">
        No active sessions
      </p>
    </div>
  {:else}
    {#each onlineUsers as user (user.id)}
      {@const flair = getFlair(user.role)}

      <div
        class="border-2 rounded-3xl p-4 transition-all group relative overflow-hidden {flair.cardClass} shadow-xl hover:border-white/20"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <img
              src={user.avatar || user.photoURL}
              alt=""
              class="w-8 h-8 rounded-lg bg-base-300 border-2 {flair.ringClass} shadow-md"
            />
            <div class="flex flex-col">
              {#if flair.label}
                <span
                  class="text-[8px] font-black text-primary uppercase tracking-widest leading-none mb-0.5"
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
              class="text-[9px] uppercase font-black italic text-error bg-white/5 px-2.5 py-1 rounded-full hover:bg-white/10"
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
            class="btn btn-ghost btn-xs btn-circle h-6 w-6 bg-white/5 hover:bg-primary hover:text-primary-content border border-white/10"
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
          <div class="w-full bg-black/40 border-l-2 border-primary p-2 rounded-r-lg">
            <p class="text-xs font-medium italic text-white/80 leading-snug">
              "{user.note}"
            </p>
          </div>
        {/if}
      </div>
    {/each}
  {/if}
</div>
