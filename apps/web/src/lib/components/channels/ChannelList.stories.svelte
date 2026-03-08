<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChannelList from './ChannelList.svelte';
  import { storyChannels } from './story-data.js';

  const manyStoryChannels = Array.from({ length: 16 }, (_, index) => {
    const base = storyChannels[index % storyChannels.length];
    return {
      ...base,
      uuid: `${base.uuid}-${String(index)}`,
      name: `${base.name} ${String(index + 1)}`,
    };
  });

  const manyStoryProgress = manyStoryChannels.reduce<Record<string, number>>((acc, channel, index) => {
    acc[channel.uuid] = ((index + 1) * 7) % 100;
    return acc;
  }, {});

  const { Story } = defineMeta({
    title: 'Components/Channels/ChannelList',
    component: ChannelList,
    args: {
      channels: storyChannels,
      selectedChannelUuid: storyChannels[0].uuid,
      progressByChannel: {
        'ch-1': 30,
        'ch-2': 55,
        'ch-7': 8,
        'ch-11': 74,
      },
    },
    globals: {
      viewport: { value: undefined, isRotated: false },
    },
  });
</script>

<Story name="Desktop">
  {#snippet template(args)}
    <div style="width: 360px; max-width: 100%; height: 560px;">
      <ChannelList {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Mobile" globals={{ viewport: { value: 'mobile1', isRotated: false } }}>
  {#snippet template(args)}
    <div style="width: 360px; max-width: 100%; height: 560px;">
      <ChannelList {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Empty" args={{ channels: [], selectedChannelUuid: null, progressByChannel: {} }}>
  {#snippet template(args)}
    <div style="width: 360px; max-width: 100%; height: 560px;">
      <ChannelList {...args} />
    </div>
  {/snippet}
</Story>

<Story
  name="FillHeightScrollable"
  args={{
    channels: manyStoryChannels,
    selectedChannelUuid: manyStoryChannels[0].uuid,
    progressByChannel: manyStoryProgress,
    fillHeight: true,
  }}
>
  {#snippet template(args)}
    <div style="width: 360px; max-width: 100%; height: 560px;">
      <ChannelList {...args} />
    </div>
  {/snippet}
</Story>
