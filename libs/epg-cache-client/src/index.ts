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
  PiconVariant,
  PiconByChannelParams,
  PiconByServiceRefParams,
} from './types.js';

export {
  EpgCacheError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
  NetworkError,
} from './errors.js';
