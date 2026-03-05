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
