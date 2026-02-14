import { Hono } from 'hono';
import type { EpgStore } from './store.js';
import type { SearchIndex } from './search.js';
import type { RefreshScheduler } from './scheduler.js';
import type { CacheHealthMeta, ApiResponse, HealthResponse, SearchResult } from './types.js';

export function createApp(
  store: EpgStore,
  searchIndex: SearchIndex,
  scheduler: RefreshScheduler,
  refreshIntervalSeconds: number,
): Hono {
  const app = new Hono();

  function buildMeta(): CacheHealthMeta {
    const meta = store.getSyncMeta();
    const lastRefreshEnd = meta.lastRefreshEnd;
    const now = Math.floor(Date.now() / 1000);
    return {
      cacheAge: lastRefreshEnd > 0 ? now - lastRefreshEnd : -1,
      lastRefresh: lastRefreshEnd > 0 ? new Date(lastRefreshEnd * 1000).toISOString() : null,
      refreshStatus: meta.status,
      totalEvents: meta.eventCount,
    };
  }

  function resolveChannelUuid(channel: string): string | undefined {
    const ch = store.getChannelByUuidOrNumber(channel);
    return ch?.uuid;
  }

  // Health endpoint
  app.get('/api/health', (c) => {
    const meta = store.getSyncMeta();
    const lastRefreshEnd = meta.lastRefreshEnd;
    const now = Math.floor(Date.now() / 1000);
    const cacheAge = lastRefreshEnd > 0 ? now - lastRefreshEnd : -1;

    let status: HealthResponse['status'];
    if (meta.eventCount === 0 && lastRefreshEnd === 0) {
      status = 'error';
    } else if (cacheAge > refreshIntervalSeconds * 2) {
      status = 'stale';
    } else {
      status = 'healthy';
    }

    const nextRefresh = scheduler.getNextRefreshTime();

    const response: HealthResponse = {
      status,
      cacheAge,
      lastRefresh: lastRefreshEnd > 0 ? new Date(lastRefreshEnd * 1000).toISOString() : null,
      refreshStatus: meta.status,
      totalEvents: meta.eventCount,
      totalChannels: meta.channelCount,
      lastRefreshDuration: meta.lastRefreshEnd > 0 ? meta.lastRefreshDuration : null,
      nextRefresh: nextRefresh ? nextRefresh.toISOString() : null,
    };

    return c.json(response);
  });

  // Fuzzy text search
  app.get('/api/events/search', (c) => {
    const q = c.req.query('q');
    if (!q) {
      return c.json({ error: 'Query parameter "q" is required' }, 400);
    }

    const channelParam = c.req.query('channel');
    const startParam = c.req.query('start');
    const stopParam = c.req.query('stop');
    const genreParam = c.req.query('genre');
    const limitParam = c.req.query('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    // Resolve channel
    let channelUuid: string | undefined;
    if (channelParam) {
      channelUuid = resolveChannelUuid(channelParam);
      if (!channelUuid) {
        return c.json({ error: `Channel "${channelParam}" not found` }, 404);
      }
    }

    const start = startParam ? parseInt(startParam, 10) : undefined;
    const stop = stopParam ? parseInt(stopParam, 10) : undefined;
    const genre = genreParam ? parseInt(genreParam, 10) : undefined;

    // Search MiniSearch for scored event IDs (fetch more than limit to allow for post-filtering)
    const searchLimit = limit * 5;
    const searchResults = searchIndex.search(q, searchLimit);

    if (searchResults.length === 0) {
      const response: ApiResponse<SearchResult[]> = { data: [], meta: buildMeta() };
      return c.json(response);
    }

    // Fetch full events from SQLite
    const eventIds = searchResults.map((r) => r.eventId);
    const events = store.getEventsByIds(eventIds);
    const eventMap = new Map(events.map((e) => [e.eventId, e]));

    // Build results with scores, applying post-filters
    const results: SearchResult[] = [];
    for (const sr of searchResults) {
      const event = eventMap.get(sr.eventId);
      if (!event) continue;
      if (channelUuid && event.channelUuid !== channelUuid) continue;
      if (start !== undefined && stop !== undefined && (event.start >= stop || event.stop <= start)) continue;
      if (genre !== undefined && event.contentType !== genre) continue;
      results.push({ score: sr.score, event });
      if (results.length >= limit) break;
    }

    const response: ApiResponse<SearchResult[]> = { data: results, meta: buildMeta() };
    return c.json(response);
  });

  // Timerange query
  app.get('/api/events/timerange', (c) => {
    const startParam = c.req.query('start');
    const stopParam = c.req.query('stop');

    if (!startParam || !stopParam) {
      return c.json({ error: 'Query parameters "start" and "stop" are required' }, 400);
    }

    const start = parseInt(startParam, 10);
    const stop = parseInt(stopParam, 10);
    const channelParam = c.req.query('channel');
    const genreParam = c.req.query('genre');
    const limitParam = c.req.query('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 100;

    let channelUuid: string | undefined;
    if (channelParam) {
      channelUuid = resolveChannelUuid(channelParam);
      if (!channelUuid) {
        return c.json({ error: `Channel "${channelParam}" not found` }, 404);
      }
    }

    const contentType = genreParam ? parseInt(genreParam, 10) : undefined;
    const events = store.getEventsByTimerange(start, stop, { channelUuid, contentType, limit });

    const response: ApiResponse<typeof events> = { data: events, meta: buildMeta() };
    return c.json(response);
  });

  // Single event by ID
  app.get('/api/events/:eventId', (c) => {
    const eventId = parseInt(c.req.param('eventId'), 10);
    if (isNaN(eventId)) {
      return c.json({ error: 'Invalid event ID' }, 400);
    }

    const event = store.getEventById(eventId);
    if (!event) {
      return c.json({ error: 'Event not found' }, 404);
    }

    const response: ApiResponse<typeof event> = { data: event, meta: buildMeta() };
    return c.json(response);
  });

  // All channels
  app.get('/api/channels', (c) => {
    const channels = store.getAllChannels();
    const response: ApiResponse<typeof channels> = { data: channels, meta: buildMeta() };
    return c.json(response);
  });

  // Manual refresh
  app.post('/api/cache/refresh', (c) => {
    if (scheduler.isRefreshing()) {
      return c.json({ error: 'Refresh already in progress' }, 409);
    }

    scheduler.refresh();
    return c.json({ message: 'Refresh started' }, 202);
  });

  return app;
}
