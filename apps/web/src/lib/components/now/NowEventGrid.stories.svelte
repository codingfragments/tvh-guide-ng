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

<Story name="Desktop">
  {#snippet template()}
    <div style="width: 1280px; max-width: 100%;">
      <NowEventGrid items={nowStoryItems} />
    </div>
  {/snippet}
</Story>

<Story name="Tablet" globals={{ viewport: { value: 'tablet', isRotated: false } }}>
  {#snippet template()}
    <div style="width: 900px; max-width: 100%;">
      <NowEventGrid items={nowStoryItems} />
    </div>
  {/snippet}
</Story>

<Story name="Mobile" globals={{ viewport: { value: 'mobile1', isRotated: false } }}>
  {#snippet template()}
    <div style="width: 375px; max-width: 100%;">
      <NowEventGrid items={nowStoryItems} />
    </div>
  {/snippet}
</Story>

<Story name="Empty" args={{ items: [] }}>
  {#snippet template()}
    <div style="width: 1280px; max-width: 100%;">
      <NowEventGrid items={[]} />
    </div>
  {/snippet}
</Story>
