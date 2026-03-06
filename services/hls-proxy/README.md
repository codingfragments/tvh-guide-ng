# @tvh-guide/hls-proxy

HLS proxy service that resolves TVHeadend channels and orchestrates `ffmpeg` transcodings per channel.

## Features

- `GET /hlsstream/:channel` as primary entrypoint (`channel` can be number or UUID)
- Server-side channel resolution via `@tvh-guide/tvheadend-client`
- Per-channel ffmpeg orchestration (one process per channel)
- HLS playlist + segment serving from generated artifacts
- Automatic stale transcoding shutdown after inactivity grace period
- Structured JSON logging with request and transcoding lifecycle events
- Health and diagnostics endpoints

## Endpoints

- `GET /hlsstream/:channel`
  - Warms up transcoding and redirects to `index.m3u8`
- `GET /hlsstream/:channel/index.m3u8`
  - Returns current media playlist
- `GET /hlsstream/:channel/:asset`
  - Returns generated segment/asset files
- `GET /api/health`
  - Liveness and runtime config summary
- `GET /api/transcodings`
  - Active transcoding sessions

## Environment Variables

Required:

- `TVH_URL`
- `TVH_USERNAME`
- `TVH_PASSWORD`
- `HLS_TVH_PROFILE` (TVHeadend profile name used for upstream stream)

Optional:

- `HLS_HTTP_PORT` (default `3010`)
- `HLS_INACTIVITY_GRACE_SECONDS` (default `90`)
- `HLS_SWEEP_INTERVAL_SECONDS` (default `10`)
- `HLS_SEGMENT_SECONDS` (default `4`)
- `HLS_PLAYLIST_SIZE` (default `8`)
- `HLS_DELETE_THRESHOLD` (default `2`, extra old segments kept before deletion)
- `HLS_STARTUP_TIMEOUT_MS` (default `15000`)
- `HLS_ASSET_WAIT_TIMEOUT_MS` (default `6000`)
- `HLS_OUTPUT_ROOT` (default `./data/hls-proxy`)
- `HLS_TVH_STREAM_PATH_TEMPLATE` (default `/stream/channel/{channelUuid}`)
- `HLS_FFMPEG_BIN` (default `ffmpeg`)
- `HLS_LOG_LEVEL` (default `info`)
- `HLS_MAX_CONCURRENT_TRANSCODINGS` (default `6`)

## Development

```bash
pnpm --filter @tvh-guide/hls-proxy run dev
```

Build + lint:

```bash
pnpm --filter @tvh-guide/hls-proxy run build
pnpm --filter @tvh-guide/hls-proxy run lint
```

## Operational Notes

- ffmpeg is started only when a channel is first requested.
- Existing channel sessions are reused across clients.
- Session activity is updated on playlist and segment requests.
- Inactive sessions are stopped and cleaned automatically.
