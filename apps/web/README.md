# @tvh-guide/web

SvelteKit frontend for TVH Guide.

## Development

```bash
pnpm --filter @tvh-guide/web dev
```

## Live Stream Component (Experimental)

`LiveChannelPlayer` resolves a channel input to either:

- the TVHeadend stream proxy (`/api/channel/[channel]/stream`) for normal TVHeadend profiles, or
- the HLS proxy entrypoint (`/hlsstream/:channel/index.m3u8`) when virtual profile `__hls_proxy__` is selected.

Component location:

- `src/lib/components/live/LiveChannelPlayer.svelte`

Example usage:

```svelte
<script lang="ts">
  import LiveChannelPlayer from '$lib/components/live/LiveChannelPlayer.svelte';
</script>

<LiveChannelPlayer channel="1" profile="webtv-h264-aac-matroska" controls muted />
```

Server endpoints used by the component:

- `GET /api/channel/[channel]`
- `GET /api/channel/[channel]/url`
- `GET /api/channel/[channel]/stream`
- `GET /api/channel/profiles`

`/api/channel/profiles` returns TVHeadend profile names; `/now/tv` also injects the virtual HLS profile option
`__hls_proxy__` in the dropdown.

### Environment Variables (`apps/web/.env`)

```bash
PUBLIC_EPG_CACHE_URL=http://localhost:3000
TVH_URL=http://localhost:9981
TVH_USERNAME=admin
TVH_PASSWORD=secret
# optional public endpoint for standalone hls-proxy service:
PUBLIC_HLS_PROXY_BASE_URL=http://localhost:3010
# optional:
TVH_STREAM_DEFAULT_PROFILE=webtv-h264-aac-matroska
TVH_STREAM_PATH_TEMPLATE=/stream/channel/{channelUuid}
```

Credentials stay server-side only (`$env/dynamic/private`).

## Picon Proxy

`ChannelLogo` and `picon://...` URLs are resolved through the web app proxy:

- `/api/picon/channel/[channelName]`
- `/api/picon/srp/[serviceRef]`

The browser no longer calls epg-cache directly for picons.

## Storybook

```bash
pnpm --filter @tvh-guide/web run storybook
```

Live component stories:

- `src/lib/components/live/LiveChannelPlayer.stories.svelte`

Picon-based stories use static mock logos from `static/storybook/picons` so Storybook works without a running backend.
