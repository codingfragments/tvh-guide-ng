<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import {
    Home as HomeIcon,
    CalendarDays as CalendarDaysIcon,
    List as ListIcon,
    Settings as SettingsIcon,
  } from 'lucide-svelte';
  import type { NavItem } from '$lib/navigation';
  import BottomNav from './BottomNav.svelte';

  const storyMainItems: NavItem[] = [
    { href: '/now', label: 'Now', icon: HomeIcon },
    { href: '/guide', label: 'Guide', icon: CalendarDaysIcon },
    { href: '/channels', label: 'Channels', icon: ListIcon },
  ];

  const storyUtilityItems: NavItem[] = [
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const { Story } = defineMeta({
    title: 'Components/BottomNav',
    component: BottomNav,
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
      viewport: { value: 'mobile1', isRotated: false },
    },
    parameters: {
      layout: 'fullscreen',
    },
  });
</script>

<!-- Container <1024px so lg:hidden stays visible -->
<Story name="Default">
  {#snippet template(args)}
    <div style="width: 375px; height: 200px;" class="flex flex-col justify-end">
      <BottomNav {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Tablet Width" globals={{ viewport: { value: 'tablet', isRotated: false } }}>
  {#snippet template(args)}
    <div style="width: 768px; height: 200px;" class="flex flex-col justify-end">
      <BottomNav {...args} />
    </div>
  {/snippet}
</Story>
