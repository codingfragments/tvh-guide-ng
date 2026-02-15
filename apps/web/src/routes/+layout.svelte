<script lang="ts">
  import { pwaInfo } from 'virtual:pwa-info';
  import '../app.css';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import TopBar from '$lib/components/TopBar.svelte';
  import BottomNav from '$lib/components/BottomNav.svelte';

  let { children } = $props();

  const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html webManifestLink}
</svelte:head>

<div class="flex h-dvh overflow-hidden">
  <!-- Desktop sidebar -->
  <Sidebar />

  <!-- Main column -->
  <div class="flex flex-1 flex-col min-w-0">
    <TopBar />

    <main class="flex-1 overflow-y-auto p-4 pb-20 lg:p-6 lg:pb-6">
      {@render children()}
    </main>

    <!-- Mobile/tablet bottom dock -->
    <BottomNav />
  </div>
</div>
