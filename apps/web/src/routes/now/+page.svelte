<script lang="ts">
  import { goto } from '$app/navigation';
  import { env } from '$env/dynamic/public';
  import TimeSelect from '$lib/components/epg/TimeSelect.svelte';
  import { parseCustomTimeAppearance, parsePresetTimes } from '$lib/components/epg/time-select-utils.js';
  import NowEventDetailsPanel from '$lib/components/now/NowEventDetailsPanel.svelte';
  import NowEventGrid from '$lib/components/now/NowEventGrid.svelte';
  import {
    PanelRightClose as PanelRightCloseIcon,
    PanelRightOpen as PanelRightOpenIcon,
  } from 'lucide-svelte';
  import type { NowEventDetail, NowEventItem } from '$lib/components/now/types';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let selectedTimestamp = $state(new Date());
  let activeNavigation = $state(false);
  let isDesktop = $state(false);
  let isDetailsPanelOpen = $state(true);
  let selectedEventId = $state<number | null>(null);
  let detailsByEventId = $state<Record<number, NowEventDetail>>({});
  let loadingByEventId = $state<Record<number, boolean>>({});
  let errorsByEventId = $state<Record<number, string | undefined>>({});
  const timePresets = parsePresetTimes(env.PUBLIC_TIMESELECT_PRESETS);
  const customAppearance = parseCustomTimeAppearance(env.PUBLIC_TIMESELECT_CUSTOM_APPEARANCE);
  const selectedItem = $derived(
    !isDesktop || selectedEventId === null
      ? null
      : data.now.items.find((item) => item.eventId === selectedEventId) || null,
  );
  const selectedDetails = $derived(
    selectedItem && detailsByEventId[selectedItem.eventId] ? detailsByEventId[selectedItem.eventId] : null,
  );
  const selectedLoading = $derived(selectedItem ? loadingByEventId[selectedItem.eventId] === true : false);
  const selectedError = $derived(selectedItem ? errorsByEventId[selectedItem.eventId] || null : null);
  const showDetailsPanel = $derived(isDesktop && isDetailsPanelOpen && selectedItem !== null);
  const contentLayoutClass = $derived(
    showDetailsPanel
      ? 'mx-auto mt-2 max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start lg:gap-4 xl:grid-cols-[minmax(0,1fr)_28rem]'
      : 'mx-auto mt-2 max-w-7xl',
  );

  onMount(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const sync = (): void => {
      isDesktop = media.matches;
    };

    sync();
    media.addEventListener('change', sync);

    return () => {
      media.removeEventListener('change', sync);
    };
  });

  $effect(() => {
    selectedTimestamp = new Date(data.now.timestamp * 1000);
  });

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

  $effect(() => {
    if (!isDesktop || data.now.items.length === 0) {
      selectedEventId = null;
      return;
    }

    const selectedExists = selectedEventId !== null && data.now.items.some((item) => item.eventId === selectedEventId);
    if (!selectedExists) {
      selectedEventId = data.now.items[0].eventId;
    }
  });

  $effect(() => {
    if (!isDesktop) {
      isDetailsPanelOpen = true;
    }
  });

  $effect(() => {
    if (!isDesktop || selectedEventId === null) return;
    if (detailsByEventId[selectedEventId] || loadingByEventId[selectedEventId]) return;

    void loadEventDetails(selectedEventId);
  });

  function handleSelect(item: NowEventItem): void {
    if (!isDesktop) {
      void goto(`/epg/${encodeURIComponent(item.channelUuid)}/eventMobile/${String(item.eventId)}`);
      return;
    }

    selectedEventId = item.eventId;
    isDetailsPanelOpen = true;
  }

  function closeDetailsPanel(): void {
    isDetailsPanelOpen = false;
  }

  function openDetailsPanel(): void {
    if (!isDesktop) return;
    isDetailsPanelOpen = true;
  }

  async function loadEventDetails(eventId: number): Promise<void> {
    loadingByEventId = { ...loadingByEventId, [eventId]: true };
    errorsByEventId = { ...errorsByEventId, [eventId]: undefined };

    try {
      const response = await fetch(`/api/now/event/${String(eventId)}`);
      if (!response.ok) {
        throw new Error(`Details request failed (${String(response.status)})`);
      }

      const details = (await response.json()) as NowEventDetail;
      detailsByEventId = { ...detailsByEventId, [eventId]: details };
    } catch (error) {
      errorsByEventId = {
        ...errorsByEventId,
        [eventId]: error instanceof Error ? error.message : 'Failed to load event details',
      };
    } finally {
      const nextLoading = { ...loadingByEventId };
      delete nextLoading[eventId];
      loadingByEventId = nextLoading;
    }
  }
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

  {#if isDesktop && !isDetailsPanelOpen && selectedItem}
    <div class="pointer-events-none fixed right-8 top-28 z-30 hidden lg:block">
      <button
        type="button"
        class="pointer-events-auto btn btn-primary btn-sm rounded-full gap-2 shadow-lg ring-1 ring-primary/30"
        onclick={openDetailsPanel}
      >
        <PanelRightOpenIcon class="size-4" />
        Show details
      </button>
    </div>
  {/if}

  <div class={contentLayoutClass}>
    <div class="min-w-0">
      <NowEventGrid
        items={data.now.items}
        selectedEventId={isDesktop ? selectedEventId : null}
        onSelect={handleSelect}
        withSidePanel={showDetailsPanel}
      />
    </div>

    {#if showDetailsPanel && selectedItem}
      <aside
        transition:fly={{ x: 20, duration: 180 }}
        class="hidden lg:sticky lg:top-24 lg:block lg:h-[calc(100dvh-7rem)] lg:self-start"
      >
        <div class="relative h-full">
          <button
            type="button"
            class="btn btn-circle btn-sm absolute -left-4 top-4 z-20 border border-base-300 bg-base-100 shadow-md"
            aria-label="Close details panel"
            onclick={closeDetailsPanel}
          >
            <PanelRightCloseIcon class="size-4" />
          </button>
          <NowEventDetailsPanel
            item={selectedItem}
            details={selectedDetails}
            loading={selectedLoading}
            error={selectedError}
            fullHeight={true}
          />
        </div>
      </aside>
    {/if}
  </div>
</div>
