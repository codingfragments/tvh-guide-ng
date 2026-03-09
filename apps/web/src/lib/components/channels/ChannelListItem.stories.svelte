<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChannelListItem from './ChannelListItem.svelte';
  import { storyChannels } from './story-data.js';

  const { Story } = defineMeta({
    title: 'Components/Channels/ChannelListItem',
    component: ChannelListItem,
    args: {
      channel: storyChannels[0],
      href: '/channels?channel=ch-1',
      selected: false,
      progressPct: 35,
    },
  });
</script>

<Story name="Default" />

<Story
  name="Selected"
  args={{
    channel: storyChannels[1],
    href: '/channels?channel=ch-2',
    selected: true,
    progressPct: 72,
  }}
/>

<Story
  name="NoNumber"
  args={{
    channel: {
      uuid: 'no-number',
      name: 'Test Channel Without Number',
      number: null,
      piconUrl: 'picon://channel/Test Channel Without Number',
    },
    href: '/channels?channel=no-number',
    selected: false,
    progressPct: null,
  }}
/>
