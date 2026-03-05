<script lang="ts">
  import { goto } from '$app/navigation';
  import { Clock3 as Clock3Icon } from 'lucide-svelte';
  import TimeSelect from '$lib/components/epg/TimeSelect.svelte';
  import NowEventGrid from '$lib/components/now/NowEventGrid.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let selectedTimestamp = $state(new Date(data.now.timestamp * 1000));
  let activeNavigation = $state(false);

  const lastUpdatedLabel = $derived(formatDateTime(data.now.timestamp));

  $effect(() => {
    if (!data.isNowMode) return;

    const intervalId = setInterval(() => {
      void goto('/now', { replaceState: true, noScroll: true, invalidateAll: true });
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  });

  $effect(() => {
    if (activeNavigation) return;
    const selectedTs = Math.floor(selectedTimestamp.getTime() / 1000);
    const serverTs = data.now.timestamp;
    if (selectedTs === serverTs) return;

    activeNavigation = true;

    const delta = Math.abs(selectedTs - Math.floor(Date.now() / 1000));
    const target = delta <= 60 ? '/now' : `/now?ts=${String(selectedTs)}`;

    void goto(target, { replaceState: true, noScroll: true, invalidateAll: true }).finally(() => {
      activeNavigation = false;
    });
  });

  function formatDateTime(ts: number): string {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ts * 1000));
  }
</script>

<svelte:head>
  <title>Now — TVH Guide</title>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-6 py-4">
  <header class="space-y-2">
    <h1 class="text-2xl font-bold">Now</h1>
    <p class="flex items-center gap-2 text-sm text-base-content/70">
      <Clock3Icon class="size-4" />
      Timestamp: {lastUpdatedLabel}
      {#if data.isNowMode}
        <span class="badge badge-success badge-sm">Auto-refresh 5m</span>
      {/if}
    </p>
  </header>

  <section class="card border border-base-300 bg-base-100 shadow-sm">
    <div class="card-body gap-3">
      <TimeSelect bind:timestamp={selectedTimestamp} />
    </div>
  </section>

  <NowEventGrid items={data.now.items} />
</div>
