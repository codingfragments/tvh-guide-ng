<script lang="ts">
  import ChannelLogo from '$lib/components/common/ChannelLogo.svelte';
  import type { NowEventItem } from './types.js';

  let { item }: { item: NowEventItem } = $props();

  const timeRange = $derived(
    `${formatTime(item.start)} - ${formatTime(item.stop)}`,
  );
  const subline = $derived(item.subtitle || item.summary || 'No additional program details available.');

  function formatTime(ts: number): string {
    const date = new Date(ts * 1000);
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }
</script>

<article class="card border border-base-300 bg-base-100 shadow-sm">
  <div class="card-body p-4">
    <div class="grid grid-cols-[auto,1fr] gap-4">
      <div class="flex min-w-0 flex-col items-start gap-3">
        <ChannelLogo src={item.piconUrl} size="xxl" alt={`Logo ${item.channelName}`} />
        <div class="text-sm font-medium text-base-content/80">
          {timeRange}
        </div>
        <progress class="progress progress-warning h-2 w-40 max-w-full" value={item.progressPct} max="100"></progress>
      </div>

      <div class="min-w-0 space-y-2">
        <h3 class="truncate text-xl font-bold leading-tight">{item.title}</h3>
        <p class="line-clamp-2 text-base text-base-content/80">{subline}</p>
      </div>
    </div>
  </div>
</article>
