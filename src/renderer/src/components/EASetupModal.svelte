<script lang="ts">
  import { AVAILABLE_TAGS, MAX_TAGS } from '../lib/constants'

  let {
    show = $bindable(),
    currentName,
    currentTags = [],
    currentNote,
    onSave,
    tagsLimit = MAX_TAGS,
    availableTags = AVAILABLE_TAGS
  } = $props<{
    show: boolean
    currentName: string
    currentTags: string[]
    currentNote: string
    onSave: (data: any) => void
    tagsLimit?: number
    availableTags?: string[]
  }>()

  let username = $state('')
  let note = $state('')
  let selectedTags = $state<string[]>([])

  $effect(() => {
    if (show) {
      username = currentName || ''
      note = currentNote || ''
      selectedTags = [...currentTags]
    }
  })

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter((t) => t !== tag)
    } else if (selectedTags.length < tagsLimit) {
      selectedTags = [...selectedTags, tag]
    }
  }

  function handleSave() {
    onSave({ username, note, tags: $state.snapshot(selectedTags) })
    show = false
  }
</script>

{#if show}
  <dialog open class="modal modal-bottom sm:modal-middle backdrop-blur-md">
    <div class="modal-box bg-base-300 border border-white/5 p-6 shadow-2xl max-w-md">
      <div class="mb-4">
        <h3 class="font-black italic text-2xl uppercase tracking-tighter leading-none">
          Session Setup
        </h3>
        <p class="text-[10px] uppercase font-bold opacity-40 tracking-widest mt-2">
          Configure your swarm presence
        </p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="label pt-0 pb-2" for="ea-id">
            <span class="label-text text-[10px] font-black uppercase opacity-50 tracking-widest"
              >EA ID (Room Code)</span
            >
          </label>
          <input
            id="ea-id"
            bind:value={username}
            class="input input-bordered w-full bg-base-100 italic font-bold border-white/5"
            placeholder="Enter EA Account..."
          />
        </div>

        <div>
          <label class="label pt-0 pb-2" for="tag-grid">
            <span class="label-text text-[10px] font-black uppercase opacity-50 tracking-widest"
              >Tags ({selectedTags.length}/{tagsLimit})</span
            >
          </label>
          <div id="tag-grid" class="flex flex-wrap gap-2">
            {#each availableTags as tag (tag)}
              <button
                onclick={() => toggleTag(tag)}
                class="btn btn-xs italic uppercase transition-all font-black {selectedTags.includes(
                  tag
                )
                  ? 'btn-primary'
                  : 'btn-ghost bg-white/5 border-none opacity-40 hover:opacity-100'}"
                disabled={!selectedTags.includes(tag) && selectedTags.length >= tagsLimit}
              >
                {tag}
              </button>
            {/each}
          </div>
        </div>

        <div>
          <label class="label pt-0 pb-2" for="session-note">
            <span class="label-text text-[10px] font-black uppercase opacity-50 tracking-widest"
              >Session Note</span
            >
          </label>
          <input
            id="session-note"
            bind:value={note}
            maxlength="50"
            placeholder="e.g. realistic skating only"
            class="input input-bordered w-full bg-base-100 text-sm italic border-white/5"
          />
        </div>
      </div>

      <div class="mt-4 flex justify-end gap-3">
        <button
          class="btn btn-ghost btn-sm uppercase font-black italic opacity-40 hover:opacity-100"
          onclick={() => (show = false)}
        >
          Cancel
        </button>
        <button
          class="btn btn-primary btn-sm px-4 uppercase font-black italic shadow-lg"
          onclick={handleSave}
        >
          Save Profile
        </button>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button onclick={() => (show = false)}>close</button>
    </form>
  </dialog>
{/if}
