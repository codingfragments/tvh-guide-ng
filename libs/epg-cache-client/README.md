# @tvh-guide/epg-cache-client

Type-safe TypeScript client for the EPG Cache service API. Zero runtime dependencies beyond the workspace — uses native `fetch` (Node 24+).

## Installation

```bash
pnpm add @tvh-guide/epg-cache-client
```

## Quick Start

```typescript
import { EpgCacheClient } from '@tvh-guide/epg-cache-client';

const client = new EpgCacheClient({
  baseUrl: 'http://localhost:3000',
  timeout: 10000, // optional, defaults to 10s
});

// Health check
const health = await client.getHealth();
console.log(health.status); // 'healthy' | 'stale' | 'error'

// Fuzzy text search
const results = await client.searchEvents({ q: 'Tagesschau', limit: 10 });
for (const { score, event } of results.data) {
  console.log(`${event.title} (score: ${score})`);
}

// Timerange query
const events = await client.getEventsByTimerange({
  start: Math.floor(Date.now() / 1000),
  stop: Math.floor(Date.now() / 1000) + 7200,
  channel: '1',
});

// Single event
const event = await client.getEvent(12345);

// List channels
const channels = await client.getChannels();

// Trigger manual refresh
const refresh = await client.triggerRefresh();
```

## API Reference

### `new EpgCacheClient(config)`

| Option    | Type     | Default | Description           |
| --------- | -------- | ------- | --------------------- |
| `baseUrl` | `string` | —       | EPG Cache service URL |
| `timeout` | `number` | `10000` | Request timeout in ms |

### Methods

| Method                         | Endpoint                    | Returns                        |
| ------------------------------ | --------------------------- | ------------------------------ |
| `getHealth()`                  | `GET /api/health`           | `HealthResponse`               |
| `searchEvents(params)`         | `GET /api/events/search`    | `ApiResponse<SearchResult[]>`  |
| `getEventsByTimerange(params)` | `GET /api/events/timerange` | `ApiResponse<EpgEvent[]>`      |
| `getEvent(eventId)`            | `GET /api/events/:eventId`  | `ApiResponse<EpgEvent>`        |
| `getChannels()`                | `GET /api/channels`         | `ApiResponse<CachedChannel[]>` |
| `triggerRefresh()`             | `POST /api/cache/refresh`   | `RefreshAcceptedResponse`      |

### Error Handling

All methods throw typed errors from the `EpgCacheError` hierarchy:

```typescript
import {
  EpgCacheClient,
  BadRequestError,
  NotFoundError,
  ConflictError,
  NetworkError,
} from '@tvh-guide/epg-cache-client';

try {
  await client.triggerRefresh();
} catch (error) {
  if (error instanceof ConflictError) {
    console.log('Refresh already in progress');
  } else if (error instanceof NetworkError) {
    console.log('Service unreachable');
  }
}
```

| Error Class       | HTTP Status | When                          |
| ----------------- | ----------- | ----------------------------- |
| `BadRequestError` | 400         | Missing or invalid parameters |
| `NotFoundError`   | 404         | Event or channel not found    |
| `ConflictError`   | 409         | Refresh already in progress   |
| `NetworkError`    | —           | Connection failed or timeout  |
| `EpgCacheError`   | other       | Any other HTTP error          |

## Development

```bash
pnpm --filter @tvh-guide/epg-cache-client build
pnpm --filter @tvh-guide/epg-cache-client test
pnpm --filter @tvh-guide/epg-cache-client test:coverage
```
