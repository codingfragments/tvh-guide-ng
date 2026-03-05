<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import NowEventGrid from './NowEventGrid.svelte';
  import { nowStoryItems } from './story-data.js';

  const { Story } = defineMeta({
    title: 'Components/Now/NowEventGrid',
    component: NowEventGrid,
    args: {
      items: nowStoryItems,
    },
    globals: {
      viewport: { value: undefined, isRotated: false },
    },
  });
</script>

<Story name="Desktop" />

<Story name="Tablet" globals={{ viewport: { value: 'tablet', isRotated: false } }} />

<Story name="Mobile" globals={{ viewport: { value: 'mobile1', isRotated: false } }} />

<Story name="Empty" args={{ items: [] }} />
