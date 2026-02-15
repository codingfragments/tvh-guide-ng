import type { EpgEvent } from '@tvh-guide/tvheadend-client';

// Re-export EpgEvent so consumers don't need to depend on tvheadend-client directly
export type { EpgEvent } from '@tvh-guide/tvheadend-client';

/** Cache health metadata included in every API response */
export interface CacheHealthMeta {
  cacheAge: number;
  lastRefresh: string | null;
  refreshStatus: 'idle' | 'refreshing' | 'error';
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

/** Cached channel stored in the EPG cache */
export interface CachedChannel {
  uuid: string;
  enabled: boolean;
  name: string;
  number: number | null;
  icon: string | null;
  iconPublicUrl: string | null;
}

/** Response from POST /api/cache/refresh (202 Accepted) */
export interface RefreshAcceptedResponse {
  message: string;
}

/** Picon logo variant */
export type PiconVariant = 'default' | 'light' | 'dark' | 'white' | 'black';

/** Parameters for picon lookup by channel name */
export interface PiconByChannelParams {
  channelName: string;
  variant?: PiconVariant;
}

/** Parameters for picon lookup by service reference */
export interface PiconByServiceRefParams {
  serviceRef: string;
  variant?: PiconVariant;
}

/** Client configuration */
export interface EpgCacheClientConfig {
  /** Base URL of the EPG cache service (e.g., 'http://localhost:3000') */
  baseUrl: string;
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
}
