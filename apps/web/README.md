# @tvh-guide/web

SvelteKit frontend for TVH Guide.

## Development

```bash
pnpm --filter @tvh-guide/web dev
```

## Live Stream Component (Experimental)

`LiveChannelPlayer` resolves a channel input to a TVHeadend live stream URL on the server, then plays it in a media component.

Component location:

- `src/lib/components/live/LiveChannelPlayer.svelte`

Example usage:

```svelte
<script lang="ts">
  import LiveChannelPlayer from '$lib/components/live/LiveChannelPlayer.svelte';
</script>

<LiveChannelPlayer channel="1" transport="hls" controls muted />
```

Server endpoints used by the component:

- `GET /api/channel/[channel]`
- `GET /api/channel/[channel]/url`
- `GET /api/channel/[channel]/stream`

### Environment Variables (`apps/web/.env`)

```bash
PUBLIC_EPG_CACHE_URL=http://localhost:3000
TVH_URL=http://localhost:9981
TVH_USERNAME=admin
TVH_PASSWORD=secret
# optional:
TVH_STREAM_PROFILE_MAP={"hls":"webtv-h264-aac-mpegts"}
TVH_STREAM_DEFAULT_TRANSPORT=hls
TVH_STREAM_PATH_TEMPLATE=/stream/channel/{channelUuid}
```

Credentials stay server-side only (`$env/dynamic/private`).

## Storybook

```bash
pnpm --filter @tvh-guide/web run storybook
```

Live component stories:

- `src/lib/components/live/LiveChannelPlayer.stories.svelte`
