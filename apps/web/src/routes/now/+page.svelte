<script lang="ts">
  import { goto } from '$app/navigation';
  import { env } from '$env/dynamic/public';
  import TimeSelect from '$lib/components/epg/TimeSelect.svelte';
  import { parseCustomTimeAppearance, parsePresetTimes } from '$lib/components/epg/time-select-utils.js';
  import NowEventGrid from '$lib/components/now/NowEventGrid.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let selectedTimestamp = $state(new Date(data.now.timestamp * 1000));
  let activeNavigation = $state(false);
  const timePresets = parsePresetTimes(env.PUBLIC_TIMESELECT_PRESETS);
  const customAppearance = parseCustomTimeAppearance(env.PUBLIC_TIMESELECT_CUSTOM_APPEARANCE);

  $effect(() => {
    if (!data.isNowMode) return;

    const intervalId = setInterval(
      () => {
        void goto('/now', { replaceState: true, noScroll: true, invalidateAll: true });
      },
      5 * 60 * 1000,
    );

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

<div class="py-3">
  <section
    class="z-20 w-full bg-base-100/95 py-2 backdrop-blur supports-[backdrop-filter]:bg-base-100/80 md:sticky md:top-0"
  >
    <div class="mx-auto max-w-7xl">
      <TimeSelect
        bind:timestamp={selectedTimestamp}
        presetTimes={timePresets}
        enableCustomTime={true}
        highlightNow={data.isNowMode}
        customTimeLabel="Uhrzeit"
        customTimeAppearance={customAppearance}
      />
    </div>
  </section>

  <div class="mx-auto mt-2 max-w-7xl">
    <NowEventGrid items={data.now.items} />
  </div>
</div>
