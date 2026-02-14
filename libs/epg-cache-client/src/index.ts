export { EpgCacheClient } from './client.js';

export type {
  EpgCacheClientConfig,
  HealthResponse,
  ApiResponse,
  CacheHealthMeta,
  SearchParams,
  SearchResult,
  TimerangeParams,
  EpgEvent,
  CachedChannel,
  RefreshAcceptedResponse,
} from './types.js';

export {
  EpgCacheError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  NetworkError,
} from './errors.js';
