<script lang="ts">
  import TwitchChat from '../../TwitchChat.svelte'
  let { channel } = $props<{ channel: string }>()
</script>

<div class="h-full w-full rounded-3xl overflow-hidden border border-white/5 bg-black shadow-inner">
  <TwitchChat {channel} />
</div>
