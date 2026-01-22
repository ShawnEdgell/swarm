<script lang="ts">
  let { activeApp = $bindable() } = $props()
</script>

<div class="h-28 w-full flex items-center justify-around px-6 pb-6 shrink-0 z-50">
  <button
    onclick={() => (activeApp = 'sessions')}
    class="w-14 h-14 rounded-2xl bg-white/5 hover:cursor-pointer border border-white/10 flex items-center justify-center text-xl transition-all duration-300 {activeApp ===
    'sessions'
      ? 'scale-110 border-primary bg-primary/10'
      : 'opacity-40 hover:opacity-80'}"
  >
    👤
  </button>

  <button
    onclick={() => (activeApp = 'chat')}
    class="w-14 h-14 rounded-2xl bg-white/5 hover:cursor-pointer border border-white/10 flex items-center justify-center text-xl transition-all duration-300 {activeApp ===
    'chat'
      ? 'scale-110 border-primary bg-primary/10'
      : 'opacity-40 hover:opacity-80'}"
  >
    💬
  </button>

  <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 opacity-5"></div>
  <div class="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 opacity-5"></div>
</div>
