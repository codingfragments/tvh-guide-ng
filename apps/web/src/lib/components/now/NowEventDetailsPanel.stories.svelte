<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import NowEventDetailsPanel from './NowEventDetailsPanel.svelte';
  import {
    featuredNowStoryDetail,
    featuredNowStoryItem,
    nowStoryDetail,
    nowStoryItems,
  } from './story-data.js';

  const { Story } = defineMeta({
    title: 'Components/Now/NowEventDetailsPanel',
    component: NowEventDetailsPanel,
    args: {
      item: featuredNowStoryItem,
      details: featuredNowStoryDetail,
      loading: false,
      error: null,
    },
    argTypes: {
      item: { table: { disable: true } },
      details: { table: { disable: true } },
    },
    globals: {
      viewport: { value: undefined, isRotated: false },
    },
  });
</script>

<Story name="Default (From Current Cache Event)">
  {#snippet template(args)}
    <div style="width: 440px; max-width: 100%;">
      <NowEventDetailsPanel {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="With Cast"
  args={{
    item: nowStoryItems[0],
    details: nowStoryDetail,
  }}
>
  {#snippet template(args)}
    <div style="width: 440px; max-width: 100%;">
      <NowEventDetailsPanel {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Loading"
  args={{
    item: featuredNowStoryItem,
    details: null,
    loading: true,
  }}
>
  {#snippet template(args)}
    <div style="width: 440px; max-width: 100%;">
      <NowEventDetailsPanel {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="Error State"
  args={{
    item: featuredNowStoryItem,
    details: null,
    loading: false,
    error: 'Details request failed (502)',
  }}
>
  {#snippet template(args)}
    <div style="width: 440px; max-width: 100%;">
      <NowEventDetailsPanel {...args} />
    </div>
  {/snippet}
</Story>
