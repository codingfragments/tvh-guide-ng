# Live Stream Experiment

Experimental live playback for `apps/web`, backed by server-side TVHeadend URL resolution and stream proxying.

## Goals

- Reusable UI component that accepts a channel input (`number` or `uuid`)
- Optional stream selection via `profile`
- Fallback to TVHeadend default profile when no explicit profile is selected
- Keep TVHeadend credentials server-side only

## Environment Variables

Set these in `apps/web/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `TVH_URL` | yes | TVHeadend base URL (e.g. `http://localhost:9981`) |
| `TVH_USERNAME` | yes | TVHeadend username with streaming privilege |
| `TVH_PASSWORD` | yes | TVHeadend password |
| `TVH_STREAM_DEFAULT_PROFILE` | no | Default stream profile when no explicit profile is selected |
| `TVH_STREAM_PATH_TEMPLATE` | no | Stream path template (`{channelUuid}` placeholder) |

`PUBLIC_*` variables are not used for this feature because credentials must remain private. Server code reads secrets via
`$env/dynamic/private`.

## API Endpoints

### `GET /api/channel/[channel]`

Canonical channel lookup endpoint (full TVHeadend channel object). Numeric inputs are resolved using TVHeadend's
`intsplit` number semantics with deterministic fallback scan.

### `GET /api/channel/[channel]/url`

Resolves channel input through TVHeadend API and returns an internal stream URL.

Query params:

- `profile` (optional)

Example response:

```json
{
  "channelInput": "1",
  "channel": {
    "uuid": "550e8400-e29b-41d4-a716-446655440030",
    "name": "Das Erste HD",
    "number": 1
  },
  "profile": "webtv-h264-aac-mpegts",
  "url": "/api/channel/1/stream?profile=webtv-h264-aac-mpegts"
}
```

### `GET /api/channel/[channel]/stream`

Server-side proxy to TVHeadend live stream endpoint, with HTTP Basic auth injected from private env vars.

### `GET /api/channel/profiles`

Loads available stream profiles from TVHeadend and returns them for UI dropdown usage.
The web API tries `/api/profile/list` (and falls back to `/api/stream/profile/list` for compatibility).
Profile values are exposed as profile names (not UUIDs).

## Component

`apps/web/src/lib/components/live/LiveChannelPlayer.svelte`

Props:

- `channel` (required)
- `profile` (optional)
- `muted`, `controls` (optional media behavior)

UI route:

- `/now/tv` renders channel input + profile dropdown populated from `GET /api/channel/profiles`
- The dropdown default can be configured with `TVH_STREAM_DEFAULT_PROFILE`

Storybook:

- `Components/Live/LiveChannelPlayer`
- Includes default/profile/loading/error/no-channel stories

## Notes

- If no profile is set, `TVH_STREAM_DEFAULT_PROFILE` is used when configured; otherwise TVHeadend/user default profile is used.
- This is experimental; production hardening should include rate limiting, access control, and observability.
