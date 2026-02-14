import type { EpgEvent } from '@tvh-guide/tvheadend-client';

/** Cache health metadata included in every API response */
export interface CacheHealthMeta {
  /** Seconds since last successful refresh */
  cacheAge: number;
  /** ISO timestamp of last refresh completion */
  lastRefresh: string | null;
  /** Current refresh status */
  refreshStatus: 'idle' | 'refreshing' | 'error';
  /** Total events in cache */
  totalEvents: number;
}

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data: T;
  meta: CacheHealthMeta;
}

/** Health endpoint response */
export interface HealthResponse {
  status: 'healthy' | 'stale' | 'error';
  cacheAge: number;
  lastRefresh: string | null;
  refreshStatus: 'idle' | 'refreshing' | 'error';
  totalEvents: number;
  totalChannels: number;
  lastRefreshDuration: number | null;
  nextRefresh: string | null;
}

/** Parameters for fuzzy text search */
export interface SearchParams {
  q: string;
  channel?: string;
  start?: number;
  stop?: number;
  genre?: number;
  limit?: number;
}

/** Parameters for timerange queries */
export interface TimerangeParams {
  start: number;
  stop: number;
  channel?: string;
  genre?: number;
  limit?: number;
}

/** A search result with relevance score */
export interface SearchResult {
  score: number;
  event: EpgEvent;
}

/** Sync metadata stored in SQLite */
export interface SyncMeta {
  lastRefreshStart: number;
  lastRefreshEnd: number;
  lastRefreshDuration: number;
  eventCount: number;
  channelCount: number;
  status: 'idle' | 'refreshing' | 'error';
}

/** Service configuration */
export interface EpgCacheConfig {
  tvheadend: {
    url: string;
    username: string;
    password: string;
  };
  refreshInterval: number;
  httpPort: number;
  sqlitePath: string;
}

/** Lightweight event projection for search indexing */
export interface IndexableEvent {
  eventId: number;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
}

/** Cached channel stored in SQLite */
export interface CachedChannel {
  uuid: string;
  enabled: boolean;
  name: string;
  number: number | null;
  icon: string | null;
  iconPublicUrl: string | null;
}
