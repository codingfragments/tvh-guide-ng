<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import NowEventCard from './NowEventCard.svelte';
  import { nowStoryItems } from './story-data.js';

  const { Story } = defineMeta({
    title: 'Components/Now/NowEventCard',
    component: NowEventCard,
    args: {
      item: nowStoryItems[0],
    },
    globals: {
      viewport: { value: undefined, isRotated: false },
    },
  });
</script>

<Story name="Default" />

<Story name="Desktop Layout">
  {#snippet template()}
    <div style="width: 720px; max-width: 100%;">
      <NowEventCard item={nowStoryItems[0]} />
    </div>
  {/snippet}
</Story>

<Story name="Mobile Layout" globals={{ viewport: { value: 'mobile1', isRotated: false } }}>
  {#snippet template()}
    <div style="width: 360px; max-width: 100%;">
      <NowEventCard item={nowStoryItems[0]} />
    </div>
  {/snippet}
</Story>

<Story
  name="LongText"
  args={{
    item: {
      ...nowStoryItems[0],
      title: 'Sehr langer Titel für ein Magazinformat mit zusätzlichen Informationen',
      subtitle:
        'Sehr lange Unterzeile mit zusätzlichen Produktionshinweisen, Gästen und redaktionellen Details, die abgeschnitten werden sollte',
    },
  }}
/>

<Story
  name="NoSubtitle"
  args={{
    item: {
      ...nowStoryItems[0],
      subtitle: undefined,
      summary: 'Summary fallback text is rendered when subtitle is not available.',
    },
  }}
/>

<Story
  name="NearEndProgress"
  args={{
    item: {
      ...nowStoryItems[0],
      progressPct: 95,
    },
  }}
/>
