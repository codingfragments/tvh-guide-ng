<script lang="ts">
  import { page } from '$app/state';
  import type { NavItem } from '$lib/navigation';
  import { mainNavItems as defaultMainItems, utilityNavItems as defaultUtilityItems, isActive } from '$lib/navigation';

  let {
    mainItems = defaultMainItems,
    utilityItems = defaultUtilityItems,
  }: { mainItems?: NavItem[]; utilityItems?: NavItem[] } = $props();

  const pathname = $derived(page.url.pathname);
  const allItems = $derived([...mainItems, ...utilityItems]);
</script>

<div class="dock lg:hidden">
  {#each allItems as item (item.href)}
    <a href={item.href} class={isActive(item.href, pathname) ? 'dock-active' : ''}>
      <item.icon class="size-5" />
      <span class="dock-label">{item.label}</span>
    </a>
  {/each}
</div>
