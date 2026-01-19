<script lang="ts">
  let { show = $bindable(false) } = $props<{
    show: boolean
  }>()

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') show = false
  }
</script>

{#if show}
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    role="button"
    tabindex="0"
    onclick={() => (show = false)}
    onkeydown={handleKeydown}
  >
    <div
      class="bg-base-300 border border-white/5 w-full max-w-xs rounded-2xl p-8 relative shadow-2xl"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      onclick={(e) => e.stopPropagation()}
    >
      <button
        onclick={() => (show = false)}
        class="btn btn-ghost btn-xs btn-circle absolute top-4 right-4 opacity-40 hover:opacity-100"
      >
        ✕
      </button>

      <h2 class="text-2xl font-black uppercase italic tracking-tighter pb-8 text-white">
        How to Join
      </h2>

      <div class="flex flex-col gap-8">
        <div class="flex items-start gap-4">
          <span class="text-primary font-black italic text-lg leading-none mt-1">01</span>
          <div class="flex flex-col gap-1">
            <h4 class="text-sm font-black uppercase italic text-white">Add EA ID</h4>
            <p class="text-xs font-medium opacity-60 leading-normal">
              Add the EA ID from a host's card as a friend in Skate.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <span class="text-primary font-black italic text-lg leading-none mt-1">02</span>
          <div class="flex flex-col gap-1">
            <h4 class="text-sm font-black uppercase italic text-white">Join Party</h4>
            <p class="text-xs font-medium opacity-60 leading-normal">
              Search their name in the EA menu & join their party.
            </p>
          </div>
        </div>

        <div class="flex items-start gap-4">
          <span class="text-primary font-black italic text-lg leading-none mt-1">03</span>
          <div class="flex flex-col gap-1">
            <h4 class="text-sm font-black uppercase italic text-white">Leave Party</h4>
            <p class="text-xs font-medium opacity-60 leading-normal">
              Once you load in, leave the party to free up the slot.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
