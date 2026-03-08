<script lang="ts">
  import ChannelLogo from '$lib/components/common/ChannelLogo.svelte';
  import NowEventCard from '$lib/components/now/NowEventCard.svelte';
  import NowEventDetailsPanel from '$lib/components/now/NowEventDetailsPanel.svelte';
  import { CalendarClock as CalendarClockIcon } from 'lucide-svelte';
  import type { NowEventDetail, NowEventItem } from '$lib/components/now/types';
  import type { ChannelListEntry } from './types.js';

  let {
    channel,
    current,
    currentDetails = null,
    currentDetailsError = null,
    upcoming,
  }: {
    channel: ChannelListEntry;
    current: NowEventItem | null;
    currentDetails?: NowEventDetail | null;
    currentDetailsError?: string | null;
    upcoming: NowEventItem[];
  } = $props();
</script>

<div class="space-y-4">
  <section class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body flex-row items-center gap-4 p-4">
      <ChannelLogo src={channel.piconUrl} size="xxl" alt={`Logo ${channel.name}`} />

      <div class="min-w-0">
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-base-content/60">Selected Channel</p>
        <h2 class="truncate text-2xl font-bold">{channel.name}</h2>
        {#if channel.number !== null}
          <p class="text-sm text-base-content/70">Channel {channel.number}</p>
        {/if}
      </div>
    </div>
  </section>

  <section class="space-y-3">
    <h3 class="text-base font-semibold">Now</h3>

    {#if current}
      <NowEventDetailsPanel
        item={current}
        details={currentDetails}
        error={currentDetailsError}
        fullHeight={false}
        sideImageOnWide={true}
      />
    {:else}
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body text-sm text-base-content/70">No currently running event found for this channel.</div>
      </div>
    {/if}
  </section>

  <section class="space-y-3">
    <h3 class="inline-flex items-center gap-2 text-base font-semibold">
      <CalendarClockIcon class="size-4" />
      Upcoming
    </h3>

    {#if upcoming.length === 0}
      <div class="card border border-base-300 bg-base-100 shadow-sm">
        <div class="card-body text-sm text-base-content/70">No upcoming events available.</div>
      </div>
    {:else}
      <div class="space-y-3">
        {#each upcoming as item (item.eventId)}
          <NowEventCard {item} showLogo={false} showProgress={false} />
        {/each}
      </div>
    {/if}
  </section>
</div>
