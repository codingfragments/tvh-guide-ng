<script lang="ts">
  import { goto } from '$app/navigation';
  import TimeSelect from '$lib/components/epg/TimeSelect.svelte';
  import NowEventGrid from '$lib/components/now/NowEventGrid.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let selectedTimestamp = $state(new Date(data.now.timestamp * 1000));
  let activeNavigation = $state(false);

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

</script>

<svelte:head>
  <title>Now — TVH Guide</title>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-4 py-3">
  <section class="bg-transparent">
    <div class="p-0">
      <TimeSelect bind:timestamp={selectedTimestamp} />
    </div>
  </section>

  <header class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">Now</h1>
    {#if data.isNowMode}
      <span class="badge badge-success badge-sm">Auto-refresh 5m</span>
    {/if}
  </header>

  <NowEventGrid items={data.now.items} />
</div>
