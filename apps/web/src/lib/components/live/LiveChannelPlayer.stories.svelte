<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import LiveChannelPlayer from './LiveChannelPlayer.svelte';
  import type { LiveStreamUrlResolver } from './live-stream-client';

  const defaultResolver: LiveStreamUrlResolver = async ({ channel, profile, transport }) => {
    await delay(200);
    return {
      channelInput: channel,
      channel: {
        uuid: channel,
        name: channel === '1' ? 'Das Erste HD' : `Channel ${channel}`,
      },
      profile: profile ?? null,
      transport: transport ?? null,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    };
  };

  const loadingResolver: LiveStreamUrlResolver = async ({ channel, profile, transport }) => {
    await delay(10000);
    return {
      channelInput: channel,
      channel: {
        uuid: channel,
        name: `Channel ${channel}`,
      },
      profile: profile ?? null,
      transport: transport ?? null,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    };
  };

  const errorResolver: LiveStreamUrlResolver = async () => {
    await delay(200);
    throw new Error('TVHeadend returned 403 (missing streaming privilege)');
  };

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const { Story } = defineMeta({
    title: 'Components/Live/LiveChannelPlayer',
    component: LiveChannelPlayer,
    args: {
      channel: '1',
      autoplay: true,
      autoplayDelay: 2,
      muted: true,
      controls: true,
      resolver: defaultResolver,
    },
    argTypes: {
      channel: { control: 'text' },
      profile: { control: 'text' },
      transport: { control: 'text' },
      autoplay: { control: 'boolean' },
      autoplayDelay: { control: 'number' },
      muted: { control: 'boolean' },
      controls: { control: 'boolean' },
      resolver: { table: { disable: true } },
    },
    globals: {
      viewport: { value: undefined, isRotated: false },
    },
  });
</script>

<Story name="Default" />

<Story name="With Profile" args={{ channel: '1', profile: 'webtv-h264-aac-matroska' }} />

<Story name="With Transport" args={{ channel: '1', transport: 'hls' }} />

<Story name="Loading" args={{ channel: '1', resolver: loadingResolver }} />

<Story name="Error" args={{ channel: '1', resolver: errorResolver }} />

<Story name="No Channel" args={{ channel: '' }} />
