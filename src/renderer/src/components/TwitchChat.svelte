<script lang="ts">
  import { user } from '$lib/stores/user'

  let { channel = 'stillmilky' } = $props<{ channel?: string }>()

  let isLoggedIn = $derived(!!$user)

  const chatUrl = $derived(
    isLoggedIn
      ? `https://www.twitch.tv/embed/${channel}/chat?parent=localhost&darkpopout=true`
      : `https://www.twitch.tv/embed/${channel}/chat?parent=localhost&darkpopout=true&mode=readonly`
  )
</script>

<div class="w-full h-full bg-black overflow-hidden">
  {#key isLoggedIn + channel}
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
