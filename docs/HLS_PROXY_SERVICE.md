# HLS Proxy Service

This document describes the architecture and behavior of the new `@tvh-guide/hls-proxy` service.

## Goals

- Provide one stable HLS entrypoint for clients: `/hlsstream/:channel`
- Resolve TVHeadend channel number/UUID server-side
- Use a configured TVHeadend profile for upstream stream selection
- Generate HLS playlist and segments via ffmpeg
- Reuse transcodings per channel across multiple clients
- Automatically stop stale transcodings after an inactivity grace window
- Provide structured logs and runtime diagnostics

## Flow

1. Client requests `GET /hlsstream/:channel`
2. Service resolves `:channel` to TVHeadend channel UUID
3. Service builds TVHeadend stream URL with configured profile
4. Service starts ffmpeg (if no active session exists for channel)
5. Service redirects to `index.m3u8`
6. Playlist/segment requests are served from local generated artifacts
7. Session is touched on each client request
8. Sweeper stops sessions with no touches within configured grace period

## Session Lifecycle

- Keyed by channel UUID
- States: `starting`, `ready`, `stopping`, `failed`
- Exactly one ffmpeg process per active channel
- Shared across all clients requesting the same channel
- Cleaned on inactivity timeout or service shutdown

## Config

See `services/hls-proxy/.env.example` for full list.

Required:

- `TVH_URL`
- `TVH_USERNAME`
- `TVH_PASSWORD`
- `HLS_TVH_PROFILE`

## Logging

Structured JSON logs (`pino`) include:

- HTTP request logs (`event=http_request`, request ID, duration, status)
- Session lifecycle (`transcoding_started`, `transcoding_ready`, `transcoding_stop`, `transcoding_finalized`)
- ffmpeg lifecycle (`ffmpeg_exit`, `ffmpeg_spawn_error`)
- ffmpeg stderr lines (`ffmpeg_log`)

## Challenges + Decisions

- Client disconnect tracking for HLS is indirect:
  - Decision: use request touches + inactivity sweeper instead of connection hooks.
- Concurrent first requests for same channel can spawn duplicate ffmpeg:
  - Decision: use per-channel startup promise locking.
- Unbounded channel starts can exhaust resources:
  - Decision: configurable `HLS_MAX_CONCURRENT_TRANSCODINGS` hard limit.
- ffmpeg can hang during stop:
  - Decision: `SIGTERM` then timeout-based `SIGKILL` fallback.
- Startup race for first playlist:
  - Decision: wait for a valid `index.m3u8` (`#EXTM3U`) before ready state.
- Slow clients can miss recently-removed segments:
  - Decision: configure ffmpeg `hls_delete_threshold` buffer to keep extra historical segments.

## Future Enhancements

- Master playlist + adaptive bitrate ladder
- Optional transcode profiles (copy vs re-encode presets)
- Prometheus metrics endpoint
- Access control and rate limiting
- Automatic recovery backoff policies per channel
