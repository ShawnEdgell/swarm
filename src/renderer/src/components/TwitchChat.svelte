<script lang="ts">
  import { user } from '$lib/stores/user'

  let { channel = 'stillmilky' } = $props<{ channel?: string }>()

  // 1. Only track if they are logged in or not, not the whole user object.
  // This prevents reloads when tags/roles change.
  let isLoggedIn = $derived(!!$user)

  // 2. Build the URL. Removing $derived and using a static check for the
  // initial load, or using a very specific derivation.
  const chatUrl = $derived(
    isLoggedIn
      ? `https://www.twitch.tv/embed/${channel}/chat?parent=localhost&darkpopout=true`
      : `https://www.twitch.tv/embed/${channel}/chat?parent=localhost&darkpopout=true&mode=readonly`
  )
</script>

<div class="w-full h-full bg-black overflow-hidden">
  {#key isLoggedIn}
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
