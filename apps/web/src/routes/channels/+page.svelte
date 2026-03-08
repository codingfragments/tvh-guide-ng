<script lang="ts">
  import ChannelDetailsPanel from '$lib/components/channels/ChannelDetailsPanel.svelte';
  import ChannelList from '$lib/components/channels/ChannelList.svelte';
  import { Film as FilmIcon } from 'lucide-svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const mobileCurrentEvent = $derived(data.events?.current ?? null);
  const mobileCurrentImage = $derived(data.currentDetails?.image || mobileCurrentEvent?.image || null);
  const mobileCurrentSubline = $derived(
    mobileCurrentEvent?.subtitle || mobileCurrentEvent?.summary || 'No additional program details available.',
  );
</script>

<svelte:head>
  <title>Channels — TVH Guide</title>
</svelte:head>

<div class="relative flex h-full min-h-0 flex-col gap-4 overflow-hidden pb-4">
  <header class="shrink-0 space-y-1"></header>

  <div class="flex min-h-0 flex-1 flex-col gap-3 md:hidden">
    <section class="min-h-0 flex-1 overflow-y-auto">
      <ChannelList
        channels={data.channels}
        selectedChannelUuid={data.selectedChannelUuid}
        progressByChannel={data.progressByChannel}
      />
    </section>

    <section
      class="shrink-0 border-t border-base-300 bg-base-100/95 pt-2 backdrop-blur supports-[backdrop-filter]:bg-base-100/85"
    >
      {#if data.selectedChannel && mobileCurrentEvent}
        <p class="mb-2 truncate px-1 text-xs font-semibold uppercase tracking-[0.12em] text-base-content/60">
          Now on {data.selectedChannel.name}
        </p>

        <article class="rounded-xl border border-base-300 bg-base-100 p-2 shadow-sm">
          <div class="flex items-start gap-3">
            <div class="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-base-200">
              {#if mobileCurrentImage}
                <img
                  src={mobileCurrentImage}
                  alt={`Poster for ${mobileCurrentEvent.title}`}
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
              {:else}
                <div class="flex h-full w-full items-center justify-center">
                  <FilmIcon class="size-7 text-base-content/40" />
                </div>
              {/if}
            </div>

            <div class="min-w-0 flex-1 space-y-2">
              <h3 class="line-clamp-2 text-sm font-semibold leading-tight">{mobileCurrentEvent.title}</h3>
              <p class="line-clamp-2 text-xs text-base-content/70">{mobileCurrentSubline}</p>
              <progress class="progress progress-warning h-1.5 w-full" value={mobileCurrentEvent.progressPct} max="100"
              ></progress>
            </div>
          </div>
        </article>
      {:else if data.eventsError}
        <div class="alert alert-warning text-sm">
          <span>{data.eventsError}</span>
        </div>
      {:else}
        <div class="rounded-xl border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content/70">
          No currently running event available.
        </div>
      {/if}
    </section>
  </div>

  <div
    class="hidden min-h-0 flex-1 gap-4 md:grid lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]"
  >
    <section class="min-h-0 min-w-0 overflow-hidden">
      <ChannelList
        channels={data.channels}
        selectedChannelUuid={data.selectedChannelUuid}
        progressByChannel={data.progressByChannel}
        fillHeight={true}
      />
    </section>

    <section class="hidden min-h-0 min-w-0 lg:block">
      {#if data.selectedChannel}
        <div class="h-full overflow-y-auto pr-1">
          <ChannelDetailsPanel
            channel={data.selectedChannel}
            current={data.events?.current ?? null}
            currentDetails={data.currentDetails}
            currentDetailsError={data.currentDetailsError}
            upcoming={data.events?.upcoming ?? []}
          />

          {#if data.eventsError}
            <div class="alert alert-warning mt-4 text-sm">
              <span>{data.eventsError}</span>
            </div>
          {/if}
        </div>
      {:else}
        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body text-sm text-base-content/70">No channels available.</div>
        </div>
      {/if}
    </section>
  </div>
</div>
