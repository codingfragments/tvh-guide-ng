<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import {
    Home as HomeIcon,
    CalendarDays as CalendarDaysIcon,
    List as ListIcon,
    Settings as SettingsIcon,
  } from 'lucide-svelte';
  import type { NavItem } from '$lib/navigation';
  import Sidebar from './Sidebar.svelte';

  const storyMainItems: NavItem[] = [
    { href: '/now', label: 'Now', icon: HomeIcon },
    { href: '/guide', label: 'Guide', icon: CalendarDaysIcon },
    { href: '/channels', label: 'Channels', icon: ListIcon },
  ];

  const storyUtilityItems: NavItem[] = [
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const { Story } = defineMeta({
    title: 'Components/Sidebar',
    component: Sidebar,
    args: {
      activePath: '/now',
      mainItems: storyMainItems,
      utilityItems: storyUtilityItems,
    },
    argTypes: {
      activePath: {
        control: 'select',
        options: ['/now', '/guide', '/channels', '/settings', '/'],
      },
      mainItems: { table: { disable: true } },
      utilityItems: { table: { disable: true } },
    },
    globals: {
      viewport: { value: undefined, isRotated: false },
    },
    parameters: {
      layout: 'fullscreen',
    },
  });
</script>

<!-- Force lg: visibility with a wide container -->
<Story name="Default">
  {#snippet template(args)}
    <div style="width: 1280px; height: 600px;" class="flex">
      <Sidebar {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Collapsed (Icon Rail)">
  {#snippet template(args)}
    <div style="width: 1280px; height: 600px;" class="flex">
      <p class="absolute top-2 right-2 text-sm text-base-content/60 z-10">
        Click the collapse button at the bottom of the sidebar
      </p>
      <Sidebar {...args} />
    </div>
  {/snippet}
</Story>
