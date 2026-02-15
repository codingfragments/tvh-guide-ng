<script lang="ts">
  import { page } from '$app/state';
  import {
    Tv as TvIcon,
    PanelLeftClose as PanelLeftCloseIcon,
    PanelLeftOpen as PanelLeftOpenIcon,
  } from 'lucide-svelte';
  import type { NavItem } from '$lib/navigation';
  import { mainNavItems as defaultMainItems, utilityNavItems as defaultUtilityItems, isActive } from '$lib/navigation';

  let {
    mainItems = defaultMainItems,
    utilityItems = defaultUtilityItems,
  }: { mainItems?: NavItem[]; utilityItems?: NavItem[] } = $props();

  let collapsed = $state(false);

  $effect(() => {
    const saved = localStorage.getItem('tvh-guide-sidebar-collapsed');
    if (saved === 'true') collapsed = true;
  });

  function toggleCollapse() {
    collapsed = !collapsed;
    localStorage.setItem('tvh-guide-sidebar-collapsed', String(collapsed));
  }

  const pathname = $derived(page.url.pathname);
</script>

<aside
  class="hidden lg:flex flex-col bg-base-200 shrink-0 h-full transition-[width] duration-200 {collapsed
    ? 'w-16'
    : 'w-60'}"
>
  <!-- Brand -->
  <div class="flex items-center gap-2 px-4 h-16 shrink-0">
    <TvIcon class="size-6 text-primary shrink-0" />
    {#if !collapsed}
      <span class="text-lg font-bold whitespace-nowrap">TVH Guide</span>
    {/if}
  </div>

  <!-- Main nav -->
  <ul class="menu flex-1 gap-1 px-2">
    {#each mainItems as item (item.href)}
      <li>
        <a
          href={item.href}
          class={isActive(item.href, pathname) ? 'menu-active' : ''}
          title={collapsed ? item.label : undefined}
        >
          <item.icon class="size-5 shrink-0" />
          {#if !collapsed}
            <span>{item.label}</span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>

  <!-- Utility nav (bottom) -->
  <ul class="menu gap-1 px-2 pb-2">
    {#each utilityItems as item (item.href)}
      <li>
        <a
          href={item.href}
          class={isActive(item.href, pathname) ? 'menu-active' : ''}
          title={collapsed ? item.label : undefined}
        >
          <item.icon class="size-5 shrink-0" />
          {#if !collapsed}
            <span>{item.label}</span>
          {/if}
        </a>
      </li>
    {/each}
  </ul>

  <!-- Collapse toggle -->
  <div class="border-t border-base-300 px-2 py-2">
    <button
      class="btn btn-ghost btn-sm w-full justify-start gap-2"
      onclick={toggleCollapse}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand' : 'Collapse'}
    >
      {#if collapsed}
        <PanelLeftOpenIcon class="size-5 shrink-0" />
      {:else}
        <PanelLeftCloseIcon class="size-5 shrink-0" />
        <span>Collapse</span>
      {/if}
    </button>
  </div>
</aside>
