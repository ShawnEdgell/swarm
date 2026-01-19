<script lang="ts">
  import { user } from '$lib/stores/user' // Import your user store

  let { channel = 'stillmilky' } = $props<{ channel?: string }>()

  // If $user exists, load the standard chat.
  // If $user is null, we add '&identity=guest' or simply force a non-interactive mode.
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
      frameborder="0"
    ></iframe>
  {/key}
</div>
