<script lang="ts">
  let { isPulsing, signalWidth, time } = $props()
</script>

<div class="h-12 w-full flex items-center justify-between px-10 pt-4 shrink-0 z-50">
  <span class="text-xs font-bold text-white/90">{time}</span>

  <div
    class="absolute left-1/2 -translate-x-1/2 top-3 h-7 bg-black rounded-full border border-white/5 flex items-center justify-center gap-2 transition-all duration-500 z-[60]"
    style="width: {isPulsing ? '150px' : '110px'}; border-color: {isPulsing
      ? 'var(--p)'
      : 'rgba(255,255,255,0.05)'}"
  >
    <div
      class="w-1.5 h-1.5 bg-primary rounded-full {isPulsing ? 'animate-ping' : 'animate-pulse'}"
    ></div>
    <span class="text-[8px] font-black text-primary tracking-tighter uppercase">
      {isPulsing ? 'HOST FOUND' : 'Swarm Live'}
    </span>
  </div>

  <div class="flex items-center gap-1.5 text-white/90">
    <div class="flex items-end gap-[2px] h-3 mb-0.5 text-white/80">
      <div class="w-[3px] rounded-full bg-current" style="height: 30%"></div>
      <div class="w-[3px] rounded-full bg-current" style="height: 60%"></div>
      <div class="w-[3px] rounded-full opacity-20 bg-current" style="height: 100%"></div>
    </div>
    <div class="w-5 h-2.5 border border-white/30 rounded-sm relative">
      <div
        class="absolute left-0 top-0 h-full bg-white/80 transition-all duration-1000"
        style="width: {signalWidth}%"
      ></div>
    </div>
  </div>
</div>
