<script lang="ts">
  import NowEventCard from './NowEventCard.svelte';
  import type { NowEventItem } from './types.js';

  let {
    items,
    selectedEventId = null,
    onSelect,
    withSidePanel = false,
  }: {
    items: NowEventItem[];
    selectedEventId?: number | null;
    onSelect?: ((item: NowEventItem) => void) | undefined;
    withSidePanel?: boolean;
  } = $props();

  const gridClass = $derived(
    withSidePanel
      ? 'grid grid-cols-1 gap-4 xl:grid-cols-2'
      : 'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3',
  );
</script>

{#if items.length === 0}
  <div class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body text-center">
      <h3 class="text-lg font-semibold">No programs running at this timestamp</h3>
      <p class="text-base-content/70">Try a different date/time or switch back to now.</p>
    </div>
  </div>
{:else}
  <div class={gridClass}>
    {#each items as item (item.eventId)}
      <NowEventCard
        {item}
        selected={selectedEventId === item.eventId}
        onSelect={onSelect ? () => onSelect(item) : undefined}
      />
    {/each}
  </div>
{/if}
