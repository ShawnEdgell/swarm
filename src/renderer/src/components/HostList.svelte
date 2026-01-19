<script lang="ts">
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

  // --- REPLICATED WEBSITE FLAIR LOGIC ---
  const getFlair = (role: string = 'member') => {
    switch (role) {
      case 'admin':
        return {
          label: 'MILKY',
          cardClass: 'border-warning bg-warning/5',
          badgeClass: 'badge-warning',
          textClass: 'text-warning',
          ringClass: 'ring-warning'
        }
      case 'host':
        return {
          label: 'OFFICIAL HOST',
          cardClass: 'border-info bg-info/5',
          badgeClass: 'badge-info',
          textClass: 'text-info',
          ringClass: 'ring-info'
        }
      default:
        return {
          label: null,
          cardClass: 'border-white/5 bg-base-200',
          badgeClass: '',
          textClass: 'text-base-content',
          ringClass: 'ring-base-300'
        }
    }
  }
</script>

<div class="flex flex-col gap-3 w-full pb-10">
  {#if onlineUsers.length === 0}
    <div
      class="py-12 border border-dashed border-white/5 rounded-2xl flex items-center justify-center opacity-20"
    >
      <p class="text-sm font-black uppercase tracking-[0.3em] italic">No active sessions</p>
    </div>
  {:else}
    {#each onlineUsers as user (user.id)}
      {@const flair = getFlair(user.role)}

      <div
        class="border rounded-xl p-5 hover:border-primary/40 transition-all group relative overflow-hidden {flair.cardClass}"
      >
        <div class="flex items-start justify-between gap-4 relative z-10">
          <div class="flex-1 min-w-0 pr-4">
            <div class="flex items-center gap-3 mb-2">
              <h3
                class="font-black uppercase italic text-2xl tracking-tighter leading-none {flair.textClass}"
              >
                {user.eaUsername || 'NO EA ID'}
              </h3>
            </div>

            {#if user.tags && user.tags.length > 0}
              <div class="flex flex-wrap gap-2 mb-2">
                {#each user.tags as tag (tag)}
                  <span
                    class="bg-base-300 text-base-content/50 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border border-white/5"
                  >
                    {tag}
                  </span>
                {/each}
              </div>
            {/if}

            {#if user.note}
              <p class="text-sm font-medium italic text-base-content/70">"{user.note}"</p>
            {/if}
          </div>

          <div class="flex flex-col items-end justify-between self-stretch shrink-0 min-h-[80px]">
            <div class="flex flex-col items-end gap-2">
              {#if flair.label}
                <span
                  class="badge {flair.badgeClass} font-black tracking-wider italic shadow-sm text-[8px] h-4 px-2 border-none"
                >
                  {flair.label}
                </span>
              {/if}

              <div class="flex items-center gap-2">
                <div class="text-right">
                  <p
                    class="text-[9px] font-black uppercase tracking-widest italic leading-none opacity-80 text-white"
                  >
                    {user.name || user.displayName || 'Skater'}
                  </p>
                </div>
                <img
                  src={user.avatar || user.photoURL}
                  alt=""
                  class="w-8 h-8 rounded-full bg-base-300 border-2 {flair.ringClass} shadow-md"
                />
              </div>
            </div>

            <div class="flex gap-1">
              {#if user.id === currentUserId}
                <button
                  onclick={onEdit}
                  class="btn btn-ghost btn-xs uppercase font-black italic text-primary">Edit</button
                >
              {:else if currentUserRole === 'admin'}
                <button
                  onclick={() => onBoot(user.id)}
                  class="btn btn-ghost btn-xs uppercase font-black italic text-error">Boot</button
                >
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}
  {/if}
</div>
