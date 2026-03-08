<script lang="ts">
  import ChannelLogo from '$lib/components/common/ChannelLogo.svelte';
  import {
    CalendarDays as CalendarDaysIcon,
    Clock3 as Clock3Icon,
    Film as FilmIcon,
    Star as StarIcon,
    Users as UsersIcon,
  } from 'lucide-svelte';
  import type { NowEventDetail, NowEventItem } from './types.js';

  let {
    item,
    details = null,
    loading = false,
    error = null,
    fullHeight = false,
    sideImageOnWide = false,
  }: {
    item: NowEventItem;
    details?: NowEventDetail | null;
    loading?: boolean;
    error?: string | null;
    fullHeight?: boolean;
    sideImageOnWide?: boolean;
  } = $props();

  const posterUrl = $derived(details?.image || item.image || null);
  const description = $derived(details?.description || item.description || item.summary || 'No detailed synopsis available.');
  const seasonNumber = $derived(details?.seasonNumber ?? item.seasonNumber);
  const episodeNumber = $derived(details?.episodeNumber ?? item.episodeNumber);
  const episodeLabel = $derived(formatEpisodeLabel(seasonNumber, episodeNumber));
  const cast = $derived(details?.cast ?? []);
  const timeRange = $derived(`${formatDate(item.start)} • ${formatTime(item.start)}-${formatTime(item.stop)}`);
  const runtimeLabel = $derived(formatRuntime(item.start, item.stop));
  const rootClass = $derived(
    fullHeight
      ? 'card h-full overflow-hidden border border-base-300 bg-base-100 shadow-xl'
      : 'card overflow-hidden border border-base-300 bg-base-100 shadow-xl',
  );
  const layoutClass = $derived(
    sideImageOnWide ? '2xl:grid 2xl:grid-cols-[22rem_1fr] 2xl:items-stretch 2xl:gap-4' : '',
  );
  const mediaWrapClass = $derived(sideImageOnWide ? 'relative 2xl:col-start-1 2xl:row-start-1 2xl:h-full' : 'relative');
  const posterClass = $derived(sideImageOnWide ? 'h-44 w-full object-cover 2xl:h-full' : 'h-44 w-full object-cover');
  const posterFallbackClass = $derived(
    sideImageOnWide
      ? 'flex h-44 w-full items-center justify-center bg-gradient-to-br from-primary/30 via-base-200 to-base-300 2xl:h-full'
      : 'flex h-44 w-full items-center justify-center bg-gradient-to-br from-primary/30 via-base-200 to-base-300',
  );
  const overlayClass = $derived(
    sideImageOnWide
      ? 'absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent 2xl:bg-gradient-to-r'
      : 'absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent',
  );
  const bodyClass = $derived(() => {
    const base = fullHeight ? 'card-body min-h-0 gap-4 overflow-y-auto p-4' : 'card-body gap-4 p-4';
    return sideImageOnWide ? `${base} 2xl:col-start-2 2xl:row-start-1` : base;
  });

  function formatTime(ts: number): string {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(ts * 1000));
  }

  function formatDate(ts: number): string {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    }).format(new Date(ts * 1000));
  }

  function formatRuntime(start: number, stop: number): string {
    const minutes = Math.max(1, Math.round((stop - start) / 60));
    if (minutes < 60) return `${String(minutes)} min`;

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    if (rest === 0) return `${String(hours)} h`;
    return `${String(hours)} h ${String(rest)} min`;
  }

  function formatEpisodeLabel(seasonNumber?: number, episodeNumber?: number): string | null {
    if (seasonNumber === undefined && episodeNumber === undefined) return null;
    if (seasonNumber !== undefined && episodeNumber !== undefined) return `S${String(seasonNumber)}E${String(episodeNumber)}`;
    if (seasonNumber !== undefined) return `Season ${String(seasonNumber)}`;
    return `Episode ${String(episodeNumber)}`;
  }
</script>

<section class={rootClass}>
  <div class={layoutClass}>
    <div class={mediaWrapClass}>
      {#if posterUrl}
        <img
          src={posterUrl}
          alt={`Poster for ${item.title}`}
          class={posterClass}
          loading="lazy"
        />
      {:else}
        <div class={posterFallbackClass}>
          <FilmIcon class="size-14 text-primary/60" />
        </div>
      {/if}
      <div class={overlayClass}></div>
      <div class="absolute inset-x-0 bottom-0 flex items-end justify-between px-4 pb-4 text-white">
        <div class="min-w-0">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">Now Playing</p>
          <h2 class="line-clamp-2 text-lg font-bold leading-tight">{item.title}</h2>
        </div>
        <ChannelLogo src={item.piconUrl} size="md" alt={`Logo ${item.channelName}`} />
      </div>
    </div>

    <div class={bodyClass}>
      <div class="flex flex-wrap gap-2">
        <span class="badge badge-outline gap-1.5">
          <CalendarDaysIcon class="size-3.5" />
          {timeRange}
        </span>
        <span class="badge badge-outline gap-1.5">
          <Clock3Icon class="size-3.5" />
          {runtimeLabel}
        </span>
        {#if episodeLabel}
          <span class="badge badge-primary badge-soft">{episodeLabel}</span>
        {/if}
        {#if details?.episodeInfo}
          <span class="badge badge-secondary badge-soft">{details.episodeInfo}</span>
        {/if}
      </div>

      {#if loading}
        <div class="flex items-center gap-2 text-sm text-base-content/70">
          <span class="loading loading-spinner loading-sm"></span>
          Loading show details...
        </div>
      {:else if error}
        <div class="rounded-xl border border-error/30 bg-error/10 p-3 text-sm text-error">
          {error}
        </div>
      {/if}

      <div class="space-y-2">
        <h3 class="text-sm font-semibold uppercase tracking-[0.12em] text-base-content/60">Synopsis</h3>
        <p class="text-sm leading-relaxed text-base-content/80">{description}</p>
      </div>

      <div class="grid grid-cols-2 gap-2 text-sm">
        {#if details?.ageRating !== undefined}
          <div class="rounded-lg bg-base-200 px-3 py-2">
            <span class="text-xs uppercase tracking-[0.1em] text-base-content/60">Age</span>
            <p class="font-semibold">FSK {details.ageRating}</p>
          </div>
        {/if}
        {#if details?.starRating !== undefined}
          <div class="rounded-lg bg-base-200 px-3 py-2">
            <span class="text-xs uppercase tracking-[0.1em] text-base-content/60">Rating</span>
            <p class="inline-flex items-center gap-1 font-semibold">
              <StarIcon class="size-4 text-warning" />
              {details.starRating}/5
            </p>
          </div>
        {/if}
      </div>

      <div class="space-y-2">
        <h3 class="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-base-content/60">
          <UsersIcon class="size-4" />
          Cast
        </h3>
        {#if cast.length > 0}
          <ul class="space-y-1.5">
            {#each cast as credit (credit.name + credit.role)}
              <li class="flex items-baseline justify-between gap-2 rounded-lg bg-base-200/70 px-3 py-2 text-sm">
                <span class="font-medium">{credit.name}</span>
                <span class="text-xs uppercase tracking-wide text-base-content/60">{credit.role}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="text-sm text-base-content/60">No cast metadata available for this event in cache.</p>
        {/if}
      </div>
    </div>
  </div>
</section>
