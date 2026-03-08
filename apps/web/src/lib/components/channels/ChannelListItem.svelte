<script lang="ts">
  import ChannelLogo from '$lib/components/common/ChannelLogo.svelte';
  import type { ChannelListEntry } from './types.js';

  let {
    channel,
    href,
    selected = false,
    progressPct = null,
  }: {
    channel: ChannelListEntry;
    href: string;
    selected?: boolean;
    progressPct?: number | null;
  } = $props();

  const channelNumberLabel = $derived(channel.number !== null ? String(channel.number) : '—');
</script>

<a
  {href}
  class="flex items-center gap-3 rounded-xl border px-3 py-2 transition hover:border-primary/40 hover:bg-base-200/40
    {selected ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-100'}"
  aria-current={selected ? 'true' : undefined}
>
  <span class="inline-flex h-8 min-w-10 items-center justify-center rounded-md border border-base-300 bg-base-200 px-2 text-sm font-semibold">
    {channelNumberLabel}
  </span>

  <ChannelLogo src={channel.piconUrl} size="md" alt={`Logo ${channel.name}`} />

  <div class="min-w-0 flex-1 space-y-1">
    <span class="block truncate text-sm font-medium">{channel.name}</span>
    {#if progressPct !== null}
      <progress class="progress progress-warning h-1.5 w-full" value={progressPct} max="100"></progress>
    {/if}
  </div>
</a>
