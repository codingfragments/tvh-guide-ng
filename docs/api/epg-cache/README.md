# EPG Cache API Documentation

OpenAPI 3.1 specification for the `@tvh-guide/epg-cache` REST API.

## Overview

The EPG Cache service syncs program guide data from TVHeadend into SQLite and exposes 6 endpoints for querying events, channels, and managing the cache.

**No authentication required** — this is an internal service.

### Endpoints

| Method | Path                    | Description                    |
| ------ | ----------------------- | ------------------------------ |
| GET    | `/api/health`           | Health check with cache status |
| GET    | `/api/events/search`    | Fuzzy text search              |
| GET    | `/api/events/timerange` | Query events by time window    |
| GET    | `/api/events/:eventId`  | Get single event by ID         |
| GET    | `/api/channels`         | List all cached channels       |
| POST   | `/api/cache/refresh`    | Trigger manual cache refresh   |

## Viewing the Docs

```bash
# From project root — serves the unified API landing page
pnpm run docs:serve
# Open http://localhost:8080 and click "EPG Cache API"

# Or open directly: http://localhost:8080/epg-cache/index.html
```

## Quick Examples

### Health check

```bash
curl http://localhost:3000/api/health
```

### Fuzzy search

```bash
curl "http://localhost:3000/api/events/search?q=Tagesschau"

# With filters
curl "http://localhost:3000/api/events/search?q=Krimi&channel=1&limit=10"
```

### Timerange query

```bash
# Events in the next 2 hours
curl "http://localhost:3000/api/events/timerange?start=$(date +%s)&stop=$(($(date +%s)+7200))"
```

### Single event

```bash
curl http://localhost:3000/api/events/123456
```

### List channels

```bash
curl http://localhost:3000/api/channels
```

### Trigger refresh

```bash
curl -X POST http://localhost:3000/api/cache/refresh
# 202 Accepted or 409 if already refreshing
```

## Validation

```bash
pnpm run validate:openapi
```

## Generate Markdown Reference

```bash
pnpm run docs:generate-md
# Creates docs/api/epg-cache/API_REFERENCE.md (gitignored)
```

## Project Structure

```
docs/api/epg-cache/
├── index.html                # Stoplight Elements documentation viewer
├── openapi.yaml              # Main OpenAPI spec (assembles $refs)
├── README.md                 # This file
├── paths/                    # Endpoint definitions
│   ├── health.yaml
│   ├── events.yaml
│   ├── channels.yaml
│   └── cache.yaml
└── components/               # Reusable OpenAPI components
    ├── schemas/
    │   ├── event.yaml        # EpgEvent schema
    │   ├── channel.yaml      # CachedChannel schema
    │   ├── common.yaml       # CacheHealthMeta, HealthResponse, SearchResult
    │   └── error.yaml        # ErrorResponse, RefreshAccepted
    ├── parameters/
    │   └── query.yaml        # Shared query parameters
    └── responses/
        └── errors.yaml       # 400, 404, 409 responses
```
