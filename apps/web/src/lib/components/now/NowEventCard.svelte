<script lang="ts">
  import ChannelLogo from '$lib/components/common/ChannelLogo.svelte';
  import type { NowEventItem } from './types.js';

  let { item }: { item: NowEventItem } = $props();

  const timeRange = $derived(`${formatTime(item.start)} - ${formatTime(item.stop)}`);
  const showDate = $derived(!isToday(item.start));
  const dayLabel = $derived(formatDay(item.start));
  const subline = $derived(item.subtitle || item.summary || 'No additional program details available.');

  function formatTime(ts: number): string {
    const date = new Date(ts * 1000);
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  }

  function formatDay(ts: number): string {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(ts * 1000));
  }

  function isToday(ts: number): boolean {
    const now = new Date();
    const date = new Date(ts * 1000);
    return (
      now.getFullYear() === date.getFullYear() && now.getMonth() === date.getMonth() && now.getDate() === date.getDate()
    );
  }
</script>

<article class="card border border-base-300 bg-base-100 shadow-sm">
  <div class="card-body px-4 pb-4 pt-4 md:px-5 md:pb-4 md:pt-4">
    <div class="grid gap-3 md:grid-cols-[6.5rem_1fr] md:gap-6">
      <div class="flex min-w-0 items-start gap-3 md:flex-col md:items-center md:gap-2">
        <div class="md:hidden">
          <ChannelLogo src={item.piconUrl} size="lg" alt={`Logo ${item.channelName}`} />
        </div>
        <div class="hidden md:block">
          <ChannelLogo src={item.piconUrl} size="xl" alt={`Logo ${item.channelName}`} />
        </div>
        <div class="min-w-0 flex-1 space-y-2 md:w-full md:flex-none md:space-y-2">
          {#if showDate}
            <div class="text-xs font-medium uppercase tracking-wide text-base-content/60">
              {dayLabel}
            </div>
          {/if}
          <div class="text-sm font-medium text-base-content/80">
            {timeRange}
          </div>
          <progress class="progress progress-warning h-2 w-full" value={item.progressPct} max="100"></progress>
        </div>
      </div>

      <div class="min-w-0 space-y-2">
        <h3 class="truncate text-xl font-bold leading-tight">{item.title}</h3>
        <p class="line-clamp-2 text-base text-base-content/80">{subline}</p>
      </div>
    </div>
  </div>
</article>
