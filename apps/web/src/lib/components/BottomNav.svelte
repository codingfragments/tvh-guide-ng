<script lang="ts">
  import { page } from '$app/state';
  import { mainNavItems, utilityNavItems, isActive } from '$lib/navigation';

  const pathname = $derived(page.url.pathname);
  const allItems = [...mainNavItems, ...utilityNavItems];
</script>

<div class="dock lg:hidden">
  {#each allItems as item (item.href)}
    <a href={item.href} class={isActive(item.href, pathname) ? 'dock-active' : ''}>
      <item.icon class="size-5" />
      <span class="dock-label">{item.label}</span>
    </a>
  {/each}
</div>
