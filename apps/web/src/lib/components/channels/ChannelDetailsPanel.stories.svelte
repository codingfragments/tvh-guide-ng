<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChannelDetailsPanel from './ChannelDetailsPanel.svelte';
  import { storyChannels, storyCurrentEvent, storyUpcomingEvents } from './story-data.js';

  const { Story } = defineMeta({
    title: 'Components/Channels/ChannelDetailsPanel',
    component: ChannelDetailsPanel,
    args: {
      channel: storyChannels[3],
      current: storyCurrentEvent,
      upcoming: storyUpcomingEvents,
    },
    globals: {
      viewport: { value: undefined, isRotated: false },
    },
  });
</script>

<Story name="Default">
  {#snippet template(args)}
    <div style="width: 960px; max-width: 100%;">
      <ChannelDetailsPanel {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="NoCurrentEvent"
  args={{
    channel: storyChannels[1],
    current: null,
    upcoming: storyUpcomingEvents,
  }}
>
  {#snippet template(args)}
    <div style="width: 960px; max-width: 100%;">
      <ChannelDetailsPanel {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="NoUpcomingEvents"
  args={{
    channel: storyChannels[0],
    current: storyCurrentEvent,
    upcoming: [],
  }}
>
  {#snippet template(args)}
    <div style="width: 960px; max-width: 100%;">
      <ChannelDetailsPanel {...args} />
    </div>
  {/snippet}
</Story>
