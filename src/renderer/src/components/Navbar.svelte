<script lang="ts">
  import { user, login, logout } from '$lib/stores/user'
</script>

<header class="navbar shrink-0 px-6 border-b border-white/5 bg-base-200/50 backdrop-blur">
  <div class="flex-1">
    <div class="flex flex-col">
      <h1 class="text-2xl font-black italic tracking-tighter uppercase">The Swarm</h1>
      <p class="text-[10px] uppercase opacity-40 font-bold tracking-[0.2em]">Live Lobby System</p>
    </div>
  </div>

  <div class="flex-none gap-4">
    {#if $user}
      <div
        class="flex items-center gap-3 bg-base-100 px-3 py-1.5 rounded-full border border-white/5"
      >
        <div class="w-2 h-2 rounded-full bg-success animate-pulse"></div>
        <span class="text-[10px] font-bold uppercase tracking-widest">{$user.name}</span>
        <button onclick={logout} class="btn btn-ghost btn-xs uppercase font-bold text-error"
          >Sign Out</button
        >
      </div>
    {:else}
      <button onclick={login} class="btn btn-primary btn-sm px-4 italic font-black uppercase"
        >Twitch Login</button
      >
    {/if}
  </div>
</header>
