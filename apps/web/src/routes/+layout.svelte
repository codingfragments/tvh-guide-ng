<script lang="ts">
  import { pwaInfo } from 'virtual:pwa-info';
  import '../app.css';
  import Sidebar from '$lib/components/navigation/Sidebar.svelte';
  import TopBar from '$lib/components/navigation/TopBar.svelte';
  import BottomNav from '$lib/components/navigation/BottomNav.svelte';
  import { mainNavItems, utilityNavItems } from '$lib/navigation';

  let { children } = $props();

  const navItems = { mainItems: mainNavItems, utilityItems: utilityNavItems };

  const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html webManifestLink}
</svelte:head>

<div class="flex h-dvh overflow-hidden">
  <!-- Desktop sidebar -->
  <Sidebar mainItems={navItems.mainItems} utilityItems={navItems.utilityItems} />

  <!-- Main column -->
  <div class="flex flex-1 flex-col min-w-0">
    <TopBar />

    <main class="flex-1 overflow-y-auto px-4 pt-4 dock-clearance lg:px-6 lg:pt-6 lg:pb-6">
      {@render children()}
    </main>

    <!-- Mobile/tablet bottom dock -->
    <BottomNav mainItems={navItems.mainItems} utilityItems={navItems.utilityItems} />
  </div>
</div>
