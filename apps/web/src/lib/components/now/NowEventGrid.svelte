<script lang="ts">
  import NowEventCard from './NowEventCard.svelte';
  import type { NowEventItem } from './types.js';

  let { items }: { items: NowEventItem[] } = $props();
</script>

{#if items.length === 0}
  <div class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body text-center">
      <h3 class="text-lg font-semibold">No programs running at this timestamp</h3>
      <p class="text-base-content/70">Try a different date/time or switch back to now.</p>
    </div>
  </div>
{:else}
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {#each items as item (item.eventId)}
      <NowEventCard {item} />
    {/each}
  </div>
{/if}
