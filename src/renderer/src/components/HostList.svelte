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
      <div
        class="bg-base-200 border border-white/5 rounded-xl p-5 hover:border-primary/40 transition-all group"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <h3
                class="font-black uppercase italic text-2xl tracking-tighter text-white leading-none"
              >
                {user.eaUsername}
              </h3>
              {#if user.role === 'admin'}
                <span class="badge badge-primary badge-xs font-black italic rounded-sm border-none"
                  >DEV</span
                >
              {/if}
            </div>

            {#if user.tags && user.tags.length > 0}
              <div class="flex flex-wrap gap-2 mb-2">
                {#each user.tags as tag (tag)}
                  <span
                    class="bg-base-300 text-white/50 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border border-white/5"
                  >
                    {tag}
                  </span>
                {/each}
              </div>
            {/if}

            {#if user.note}
              <p class="text-sm font-medium italic opacity-80">
                "{user.note}"
              </p>
            {/if}
          </div>

          <div class="flex flex-col items-end justify-between self-stretch shrink-0">
            <div class="flex items-center gap-2">
              <span
                class="text-[9px] font-black uppercase tracking-widest italic leading-none opacity-40"
              >
                {user.name}
              </span>
              <img src={user.avatar} alt="" class="w-5 h-5 rounded" />
            </div>

            <div class="flex gap-1">
              {#if user.id === currentUserId}
                <button
                  onclick={onEdit}
                  class="btn btn-ghost btn-xs uppercase font-black italic text-primary"
                >
                  Edit
                </button>
              {:else if currentUserRole === 'admin'}
                <button
                  onclick={() => onBoot(user.id)}
                  class="btn btn-ghost btn-xs uppercase font-black italic text-error"
                >
                  Boot
                </button>
              {/if}
            </div>
          </div>
        </div>
      </div>
    {/each}
  {/if}
</div>
