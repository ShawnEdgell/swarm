<script lang="ts">
  import { user } from '$lib/stores/user'

  let { channel = 'stillmilky' } = $props<{ channel?: string }>()

  // parent=localhost is required for the embed to work in Electron
  const chatUrl = $derived(
    $user
      ? `https://www.twitch.tv/embed/${channel}/chat?parent=localhost&darkpopout=true`
      : `https://www.twitch.tv/embed/${channel}/chat?parent=localhost&darkpopout=true&mode=readonly`
  )
</script>

<div class="w-full h-full bg-black overflow-hidden">
  {#key $user}
    <iframe
      id="twitch-chat-embed"
      title="Twitch Chat"
      src={chatUrl}
      height="100%"
      width="100%"
      class="border-none"
    ></iframe>
  {/key}
</div>
