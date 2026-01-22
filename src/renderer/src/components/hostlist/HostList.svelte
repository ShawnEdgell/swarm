<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { sortUsers } from '$lib/utils/hostHelpers'
  import HostCard from './HostCard.svelte'

  let { onlineUsers = [], isMobile = false, ...props } = $props()

  let now = $state(Date.now())
  let interval: any

  onMount(() => {
    interval = setInterval(() => {
      now = Date.now()
    }, 60000)
  })

  onDestroy(() => clearInterval(interval))

  const sortedUsers = $derived(sortUsers(onlineUsers, now))
</script>

<div class="flex flex-col {isMobile ? 'gap-2.5' : 'gap-3'} w-full pb-10">
  {#if sortedUsers.length === 0}
    <div
      class="py-12 border border-dashed border-white/5 rounded-3xl flex items-center justify-center opacity-20"
    >
      <p class="text-base font-black uppercase tracking-[0.3em] italic text-white">
        No active sessions
      </p>
    </div>
  {:else}
    {#each sortedUsers as user (user.id)}
      <HostCard
        {user}
        {now}
        {isMobile}
        currentUserId={props.currentUserId}
        currentUserRole={props.currentUserRole}
        onEdit={props.onEdit}
        onBoot={props.onBoot}
      />
    {/each}
  {/if}
</div>
