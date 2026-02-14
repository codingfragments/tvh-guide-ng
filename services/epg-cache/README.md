# @tvh-guide/epg-cache

EPG caching service that syncs data from TVHeadend into SQLite for structured queries and builds a MiniSearch index for fuzzy full-text search across titles and descriptions.

## Overview

TVHeadend's API only supports regex-based filtering on individual fields. This service adds:

- **SQLite storage** for efficient timerange and channel queries with indexes
- **MiniSearch** for fuzzy full-text search across title, subtitle, summary, and description
- **Periodic sync** with configurable refresh interval (default: 1 hour)
- **Hono HTTP API** consumed by CLI, web app, and other clients

## Quick Start

```bash
pnpm --filter @tvh-guide/epg-cache build

# Option 1: Use a .env file
cp services/epg-cache/.env.example services/epg-cache/.env
# Edit .env with your TVHeadend credentials
node services/epg-cache/dist/index.js

# Option 2: Inline environment variables
TVH_URL=http://tvheadend:9981 TVH_USERNAME=admin TVH_PASSWORD=pass \
  node services/epg-cache/dist/index.js
```

The server starts immediately and serves health/empty responses while the first refresh runs.

## Configuration

The service loads a `.env` file from the current working directory if present (using Node's built-in `process.loadEnvFile()`). Copy `.env.example` to `.env` and adjust as needed. Environment variables set in the shell take precedence.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TVH_URL` | Yes | — | TVHeadend server URL |
| `TVH_USERNAME` | No | (empty) | Username for authentication |
| `TVH_PASSWORD` | No | (empty) | Password for authentication |
| `EPG_REFRESH_INTERVAL` | No | 3600 | Refresh interval in seconds |
| `EPG_HTTP_PORT` | No | 3000 | HTTP server port |
| `EPG_SQLITE_PATH` | No | ./data/epg-cache.db | SQLite database file path |

## API Reference

Full OpenAPI 3.1 specification: [`docs/api/epg-cache/`](../../docs/api/epg-cache/) — view interactively with `pnpm run docs:serve`.

### Endpoints Summary

### Health Check

```bash
curl http://localhost:3000/api/health
```

```json
{
  "status": "healthy",
  "cacheAge": 542,
  "lastRefresh": "2026-02-14T10:00:00.000Z",
  "refreshStatus": "idle",
  "totalEvents": 48521,
  "totalChannels": 150,
  "nextRefresh": "2026-02-14T11:00:00.000Z"
}
```

Status values: `healthy` (cacheAge < 2x interval), `stale` (cacheAge > 2x interval), `error` (0 events and never refreshed).

### Fuzzy Text Search

`GET /api/events/search?q=<query>&channel=<uuid|number>&start=<epoch>&stop=<epoch>&genre=<code>&limit=<n>`

Required: `q`. Optional: `channel`, `start`, `stop`, `genre`, `limit` (default 20).

```bash
# Simple search
curl "http://localhost:3000/api/events/search?q=Tagesschau"

# Search with channel filter (by number)
curl "http://localhost:3000/api/events/search?q=Krimi&channel=1"

# Search with timerange filter
curl "http://localhost:3000/api/events/search?q=Nachrichten&start=1704067200&stop=1704153600"

# Search with genre filter (content type code 16 = Movie)
curl "http://localhost:3000/api/events/search?q=Thriller&genre=16"

# Combined filters
curl "http://localhost:3000/api/events/search?q=Krimi&channel=1&start=1704067200&stop=1704153600&genre=16&limit=10"
```

```json
{
  "data": [
    {
      "score": 15.2,
      "event": { "eventId": 123, "title": "Tagesschau", "channelName": "Das Erste HD", "..." : "..." }
    }
  ],
  "meta": { "cacheAge": 120, "lastRefresh": "...", "refreshStatus": "idle", "totalEvents": 48521 }
}
```

### Timerange Query

`GET /api/events/timerange?start=<epoch>&stop=<epoch>&channel=<uuid|number>&genre=<code>&limit=<n>`

Required: `start`, `stop`. Optional: `channel`, `genre`, `limit` (default 100).

```bash
# All events in the next 2 hours
curl "http://localhost:3000/api/events/timerange?start=$(date +%s)&stop=$(($(date +%s)+7200))"

# Events on channel 1
curl "http://localhost:3000/api/events/timerange?start=$(date +%s)&stop=$(($(date +%s)+7200))&channel=1"

# Movies in the next 24 hours
curl "http://localhost:3000/api/events/timerange?start=$(date +%s)&stop=$(($(date +%s)+86400))&genre=16"
```

### Single Event

```bash
curl http://localhost:3000/api/events/123456
```

### List Channels

```bash
curl http://localhost:3000/api/channels
```

### Trigger Manual Refresh

```bash
curl -X POST http://localhost:3000/api/cache/refresh
# Returns 202 Accepted or 409 if already refreshing
```

## Architecture

```
TVHeadend Server
       ^ (periodic full refresh)
+------------------------------+
|  @tvh-guide/epg-cache        |
|                              |
|  Loader -> SQLite (structured|
|            queries, storage) |
|         -> MiniSearch (fuzzy |
|            text search)      |
|                              |
|  Hono HTTP API               |
+------------------------------+
       v (consumed by CLI, web)
```

- **Full refresh** on configurable interval — not incremental, since events change on the backend
- **SQLite** stores all event and channel data with indexes on timerange and channel
- **MiniSearch** rebuilds from SQLite after each refresh for fuzzy text search
- **Search flow**: MiniSearch returns scored event IDs, SQLite fetches full events, post-filter by channel/timerange/genre

## Development

```bash
pnpm --filter @tvh-guide/epg-cache build
pnpm --filter @tvh-guide/epg-cache test
pnpm --filter @tvh-guide/epg-cache dev    # watch mode
```
