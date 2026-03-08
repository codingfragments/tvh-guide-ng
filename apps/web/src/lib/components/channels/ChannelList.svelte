<script lang="ts">
  import ChannelListItem from './ChannelListItem.svelte';
  import type { ChannelListEntry } from './types.js';

  let {
    channels,
    selectedChannelUuid = null,
    progressByChannel = {},
    fillHeight = false,
    basePath = '/channels',
  }: {
    channels: ChannelListEntry[];
    selectedChannelUuid?: string | null;
    progressByChannel?: Record<string, number>;
    fillHeight?: boolean;
    basePath?: string;
  } = $props();

  const cardClass = $derived(
    fillHeight
      ? 'card h-full overflow-hidden border border-base-300 bg-base-100 shadow-sm'
      : 'card border border-base-300 bg-base-100 shadow-sm',
  );
  const bodyClass = $derived(fillHeight ? 'card-body min-h-0 gap-2 overflow-y-auto p-3' : 'card-body gap-2 p-3');

  function toChannelHref(channelUuid: string): string {
    return `${basePath}?channel=${encodeURIComponent(channelUuid)}`;
  }
</script>

{#if channels.length === 0}
  <div class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body text-center">
      <h3 class="text-lg font-semibold">No channels available</h3>
      <p class="text-base-content/70">The channel cache is empty right now.</p>
    </div>
  </div>
{:else}
  <div class={cardClass}>
    <div class={bodyClass}>
      {#each channels as channel (channel.uuid)}
        <ChannelListItem
          {channel}
          href={toChannelHref(channel.uuid)}
          selected={selectedChannelUuid === channel.uuid}
          progressPct={progressByChannel[channel.uuid] ?? null}
        />
      {/each}
    </div>
  </div>
{/if}
