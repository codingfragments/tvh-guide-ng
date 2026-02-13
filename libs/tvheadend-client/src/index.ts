/**
 * TVHeadend API Client Library
 *
 * Type-safe TypeScript client for the TVHeadend API
 *
 * @example
 * ```typescript
 * import { TVHeadendClient } from '@tvh-guide/tvheadend-client';
 *
 * const client = new TVHeadendClient({
 *   baseUrl: 'http://localhost:9981',
 *   username: 'admin',
 *   password: 'secret',
 * });
 *
 * // Get current EPG events
 * const events = await client.getEpgEventsGrid({ mode: 'now', limit: 10 });
 *
 * // Schedule a recording
 * const recording = await client.createDvrEntryByEvent({ event_id: 123456 });
 *
 * // List channels
 * const channels = await client.getChannelGrid({ sort: 'number' });
 * ```
 *
 * @module @tvh-guide/tvheadend-client
 */

// Main client
export { TVHeadendClient, type TVHeadendClientConfig } from './client.js';

// All types
export * from './types/index.js';

// Error classes for error handling
export {
  TVHeadendError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BadRequestError,
  NetworkError,
} from './utils/errors.js';
