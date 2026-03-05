<script lang="ts">
  import { goto } from '$app/navigation';
  import NowEventDetailsPanel from '$lib/components/now/NowEventDetailsPanel.svelte';
  import { ArrowLeft as ArrowLeftIcon, X as XIcon } from 'lucide-svelte';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let canGoBack = $state(false);

  onMount(() => {
    canGoBack = window.history.length > 1;
  });

  async function handleClose(): Promise<void> {
    if (canGoBack) {
      window.history.back();
      return;
    }
    await goto('/now');
  }
</script>

<svelte:head>
  <title>{data.item.title} — TVH Guide</title>
</svelte:head>

<div class="min-h-dvh bg-base-200 px-3 pb-4 pt-3">
  <div class="mx-auto flex max-w-3xl items-center justify-between pb-3">
    <button type="button" class="btn btn-ghost btn-sm gap-2" onclick={handleClose}>
      <ArrowLeftIcon class="size-4" />
      Back
    </button>
    <button type="button" class="btn btn-circle btn-sm" aria-label="Close" onclick={handleClose}>
      <XIcon class="size-4" />
    </button>
  </div>

  <div class="mx-auto max-w-3xl">
    <NowEventDetailsPanel item={data.item} details={data.detail} fullHeight={false} />
  </div>
</div>
