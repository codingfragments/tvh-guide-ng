/**
 * TVHeadend API Client
 * @module client
 */

import { createBasicAuthHeader } from './utils/auth.js';
import { request, buildUrl, serializeFilter } from './utils/http.js';
import type {
  // EPG types
  EpgGridParams,
  EpgGridResponse,
  EpgEventDetail,
  EpgEventsLoadResponse,
  ContentType,
  EpgBrand,
  // Channel types
  ChannelGridParams,
  ChannelGridResponse,
  ChannelListResponse,
  Channel,
  ChannelClass,
  ChannelTagGridParams,
  ChannelTagGridResponse,
  ChannelTagListResponse,
  ChannelTag,
  ChannelTagClass,
  ChannelCategory,
  // DVR types
  DvrGridParams,
  DvrGridResponse,
  DvrEntry,
  DvrEntryClass,
  DvrEntryCreateParams,
  DvrEntryByEventParams,
  DvrCancelParams,
  DvrStopParams,
  DvrRemoveParams,
  DvrFileMovedParams,
  DvrMoveFinishedParams,
  DvrMoveFailedParams,
  DvrAutorecGridParams,
  DvrAutorecGridResponse,
  DvrAutorecEntry,
  DvrAutorecCreateParams,
  DvrTimerecGridParams,
  DvrTimerecGridResponse,
  DvrConfigGridParams,
  DvrConfigGridResponse,
  DvrConfig,
  DvrConfigClass,
  // Config types
  ConfigNode,
  ServerInfo,
  ServerCapabilities,
  ConfigSaveParams,
  // Status types
  ConnectionsResponse,
  SubscriptionsResponse,
  ActivityStatusResponse,
  InputsResponse,
  InputStatsClearParams,
  ConnectionCancelParams,
  ServiceGridResponse,
  LogQueryParams,
  LogResponse,
} from './types/index.js';

/**
 * Configuration options for TVHeadend client
 */
export interface TVHeadendClientConfig {
  /** Base URL of TVHeadend server (e.g., 'http://localhost:9981') */
  baseUrl: string;
  /** Username for authentication */
  username: string;
  /** Password for authentication */
  password: string;
  /** Optional request timeout in milliseconds */
  timeout?: number;
}

/**
 * Type-safe client for TVHeadend API
 *
 * @example
 * ```typescript
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
 * ```
 */
export class TVHeadendClient {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly timeout?: number;

  /**
   * Creates a new TVHeadend API client
   * @param config - Client configuration
   */
  constructor(config: TVHeadendClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.authHeader = createBasicAuthHeader(config.username, config.password);
    this.timeout = config.timeout;
  }

  /**
   * Makes an authenticated HTTP request
   * @private
   */
  private async request<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const url = buildUrl(this.baseUrl, path, params as Record<string, string | number | boolean | undefined>);
    return request<T>(url, {
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      timeout: this.timeout,
    });
  }

  /**
   * Makes an authenticated POST request
   * @private
   */
  private async post<T>(path: string, body?: unknown): Promise<T> {
    const url = buildUrl(this.baseUrl, path);
    return request<T>(url, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      timeout: this.timeout,
    });
  }

  // ========================================
  // EPG Endpoints (6)
  // ========================================

  /**
   * Get EPG events grid with pagination and filtering
   * @param params - Grid query parameters
   * @returns Paginated EPG events
   */
  async getEpgEventsGrid(params?: EpgGridParams): Promise<EpgGridResponse> {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.filter) {
      queryParams.filter = serializeFilter(params.filter);
    }
    return this.request<EpgGridResponse>('/api/epg/events/grid', queryParams);
  }

  /**
   * Load detailed information for specific EPG events
   * @param eventIds - Single event ID or array of event IDs
   * @returns Response with total count and event details
   */
  async loadEpgEvents(eventIds: number | number[]): Promise<EpgEventsLoadResponse> {
    const ids = Array.isArray(eventIds) ? eventIds : [eventIds];
    return this.request<EpgEventsLoadResponse>('/api/epg/events/load', {
      eventId: ids.join(','),
    });
  }

  /**
   * List all available content types
   * @returns Array of content types
   */
  async listContentTypes(): Promise<ContentType[]> {
    return this.request<ContentType[]>('/api/epg/content_type/list');
  }

  /**
   * Get alternative broadcasts of the same program
   * @param eventId - EPG event ID
   * @returns Array of alternative events
   */
  async getAlternativeEvents(eventId: number): Promise<EpgEventDetail[]> {
    return this.request<EpgEventDetail[]>('/api/epg/events/alternative', { eventId });
  }

  /**
   * Get related events (e.g., other episodes in a series)
   * @param eventId - EPG event ID
   * @returns Array of related events
   */
  async getRelatedEvents(eventId: number): Promise<EpgEventDetail[]> {
    return this.request<EpgEventDetail[]>('/api/epg/events/related', { eventId });
  }

  /**
   * List EPG brands (deprecated - may not be available in all versions)
   * @deprecated Use series-based methods instead
   * @returns Array of brands
   */
  async listEpgBrands(): Promise<EpgBrand[]> {
    return this.request<EpgBrand[]>('/api/epg/brand/list');
  }

  // ========================================
  // Channel Endpoints (10)
  // ========================================

  /**
   * Get channels grid with pagination and filtering
   * @param params - Grid query parameters
   * @returns Paginated channels
   */
  async getChannelGrid(params?: ChannelGridParams): Promise<ChannelGridResponse> {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.filter) {
      queryParams.filter = serializeFilter(params.filter);
    }
    return this.request<ChannelGridResponse>('/api/channel/grid', queryParams);
  }

  /**
   * Get flat list of all channels
   * @returns Array of channels
   */
  async getChannelList(): Promise<ChannelListResponse> {
    return this.request<ChannelListResponse>('/api/channel/list');
  }

  /**
   * Create a new channel
   * @param params - Channel configuration
   * @returns Created channel
   */
  async createChannel(params: Partial<Channel>): Promise<Channel> {
    return this.post<Channel>('/api/channel/create', params);
  }

  /**
   * Get channel class definition (for UI builders)
   * @returns Channel class metadata
   */
  async getChannelClass(): Promise<ChannelClass> {
    return this.request<ChannelClass>('/api/channel/class');
  }

  /**
   * Rename a channel by number
   * @param channelNumber - Channel number to rename
   * @param newName - New channel name
   */
  async renameChannel(channelNumber: number, newName: string): Promise<void> {
    await this.post<void>('/api/channel/rename', {
      number: channelNumber,
      name: newName,
    });
  }

  /**
   * Get channel tags grid with pagination
   * @param params - Grid query parameters
   * @returns Paginated channel tags
   */
  async getChannelTagGrid(params?: ChannelTagGridParams): Promise<ChannelTagGridResponse> {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.filter) {
      queryParams.filter = serializeFilter(params.filter);
    }
    return this.request<ChannelTagGridResponse>('/api/channeltag/grid', queryParams);
  }

  /**
   * Get flat list of all channel tags
   * @returns Array of channel tags
   */
  async getChannelTagList(): Promise<ChannelTagListResponse> {
    return this.request<ChannelTagListResponse>('/api/channeltag/list');
  }

  /**
   * Get channel tag class definition (for UI builders)
   * @returns Channel tag class metadata
   */
  async getChannelTagClass(): Promise<ChannelTagClass> {
    return this.request<ChannelTagClass>('/api/channeltag/class');
  }

  /**
   * Create a new channel tag
   * @param params - Tag configuration
   * @returns Created tag
   */
  async createChannelTag(params: Partial<ChannelTag>): Promise<ChannelTag> {
    return this.post<ChannelTag>('/api/channeltag/create', params);
  }

  /**
   * List all available channel categories
   * @returns Array of categories
   */
  async listChannelCategories(): Promise<ChannelCategory[]> {
    return this.request<ChannelCategory[]>('/api/channel/category/list');
  }

  // ========================================
  // DVR Endpoints (23)
  // ========================================

  /**
   * Get DVR entries grid with pagination and filtering
   * @param params - Grid query parameters
   * @returns Paginated DVR entries
   */
  async getDvrEntryGrid(params?: DvrGridParams): Promise<DvrGridResponse> {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.filter) {
      queryParams.filter = serializeFilter(params.filter);
    }
    return this.request<DvrGridResponse>('/api/dvr/entry/grid', queryParams);
  }

  /**
   * Get upcoming recordings
   * @param params - Grid query parameters
   * @returns Paginated upcoming recordings
   */
  async getDvrEntryGridUpcoming(params?: DvrGridParams): Promise<DvrGridResponse> {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.filter) {
      queryParams.filter = serializeFilter(params.filter);
    }
    return this.request<DvrGridResponse>('/api/dvr/entry/grid_upcoming', queryParams);
  }

  /**
   * Get finished recordings
   * @param params - Grid query parameters
   * @returns Paginated finished recordings
   */
  async getDvrEntryGridFinished(params?: DvrGridParams): Promise<DvrGridResponse> {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.filter) {
      queryParams.filter = serializeFilter(params.filter);
    }
    return this.request<DvrGridResponse>('/api/dvr/entry/grid_finished', queryParams);
  }

  /**
   * Get failed recordings
   * @param params - Grid query parameters
   * @returns Paginated failed recordings
   */
  async getDvrEntryGridFailed(params?: DvrGridParams): Promise<DvrGridResponse> {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.filter) {
      queryParams.filter = serializeFilter(params.filter);
    }
    return this.request<DvrGridResponse>('/api/dvr/entry/grid_failed', queryParams);
  }

  /**
   * Get removed recordings
   * @param params - Grid query parameters
   * @returns Paginated removed recordings
   */
  async getDvrEntryGridRemoved(params?: DvrGridParams): Promise<DvrGridResponse> {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.filter) {
      queryParams.filter = serializeFilter(params.filter);
    }
    return this.request<DvrGridResponse>('/api/dvr/entry/grid_removed', queryParams);
  }

  /**
   * Get DVR entry class definition (for UI builders)
   * @returns DVR entry class metadata
   */
  async getDvrEntryClass(): Promise<DvrEntryClass> {
    return this.request<DvrEntryClass>('/api/dvr/entry/class');
  }

  /**
   * Create a new DVR entry (manual recording)
   * @param params - Recording parameters
   * @returns Created DVR entry
   */
  async createDvrEntry(params: DvrEntryCreateParams): Promise<DvrEntry> {
    return this.post<DvrEntry>('/api/dvr/entry/create', params);
  }

  /**
   * Create DVR entry from EPG event (schedule recording)
   * @param params - Event ID and optional configuration
   * @returns Created DVR entry
   */
  async createDvrEntryByEvent(params: DvrEntryByEventParams): Promise<DvrEntry> {
    return this.post<DvrEntry>('/api/dvr/entry/create_by_event', params);
  }

  /**
   * Cancel a scheduled recording
   * @param params - Entry UUID to cancel
   */
  async cancelDvrEntry(params: DvrCancelParams): Promise<void> {
    await this.post<void>('/api/dvr/entry/cancel', params);
  }

  /**
   * Stop an active recording
   * @param params - Entry UUID to stop
   */
  async stopDvrEntry(params: DvrStopParams): Promise<void> {
    await this.post<void>('/api/dvr/entry/stop', params);
  }

  /**
   * Remove a DVR entry (mark as removed)
   * @param params - Entry UUID to remove
   */
  async removeDvrEntry(params: DvrRemoveParams): Promise<void> {
    await this.post<void>('/api/dvr/entry/remove', params);
  }

  /**
   * Notify TVHeadend that a recording file was moved
   * @param params - Old and new file paths
   */
  async notifyDvrFileMoved(params: DvrFileMovedParams): Promise<void> {
    await this.post<void>('/api/dvr/entry/filemoved', params);
  }

  /**
   * Move a DVR entry to finished status
   * @param params - Entry UUID
   */
  async moveDvrToFinished(params: DvrMoveFinishedParams): Promise<void> {
    await this.post<void>('/api/dvr/entry/move/finished', params);
  }

  /**
   * Move a DVR entry to failed status
   * @param params - Entry UUID
   */
  async moveDvrToFailed(params: DvrMoveFailedParams): Promise<void> {
    await this.post<void>('/api/dvr/entry/move/failed', params);
  }

  /**
   * Re-record a failed recording
   * @param uuid - Entry UUID to re-record
   */
  async rerecordDvrEntry(uuid: string): Promise<void> {
    await this.post<void>('/api/dvr/entry/rerecord', { uuid });
  }

  /**
   * Re-record all failed recordings
   */
  async rerecordAllFailed(): Promise<void> {
    await this.post<void>('/api/dvr/entry/rerecord/all');
  }

  /**
   * Get auto-recording rules grid
   * @param params - Grid query parameters
   * @returns Paginated autorec entries
   */
  async getDvrAutorecGrid(params?: DvrAutorecGridParams): Promise<DvrAutorecGridResponse> {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.filter) {
      queryParams.filter = serializeFilter(params.filter);
    }
    return this.request<DvrAutorecGridResponse>('/api/dvr/autorec/grid', queryParams);
  }

  /**
   * Create a new auto-recording rule
   * @param params - Autorec configuration
   * @returns Created autorec entry
   */
  async createDvrAutorec(params: DvrAutorecCreateParams): Promise<DvrAutorecEntry> {
    return this.post<DvrAutorecEntry>('/api/dvr/autorec/create', params);
  }

  /**
   * Create autorec rule from series/brand
   * @param eventId - EPG event ID from the series
   * @returns Created autorec entry
   */
  async createAutorecBySeries(eventId: number): Promise<DvrAutorecEntry> {
    return this.post<DvrAutorecEntry>('/api/dvr/autorec/create_by_series', { eventId });
  }

  /**
   * Get time-based recording rules grid
   * @param params - Grid query parameters
   * @returns Paginated timerec entries
   */
  async getDvrTimerecGrid(params?: DvrTimerecGridParams): Promise<DvrTimerecGridResponse> {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.filter) {
      queryParams.filter = serializeFilter(params.filter);
    }
    return this.request<DvrTimerecGridResponse>('/api/dvr/timerec/grid', queryParams);
  }

  /**
   * Get DVR configurations grid
   * @param params - Grid query parameters
   * @returns Paginated DVR configs
   */
  async getDvrConfigGrid(params?: DvrConfigGridParams): Promise<DvrConfigGridResponse> {
    const queryParams: Record<string, unknown> = { ...params };
    if (params?.filter) {
      queryParams.filter = serializeFilter(params.filter);
    }
    return this.request<DvrConfigGridResponse>('/api/dvr/config/grid', queryParams);
  }

  /**
   * Get DVR config class definition (for UI builders)
   * @returns DVR config class metadata
   */
  async getDvrConfigClass(): Promise<DvrConfigClass> {
    return this.request<DvrConfigClass>('/api/dvr/config/class');
  }

  /**
   * Create a new DVR configuration profile
   * @param params - Config parameters
   * @returns Created config
   */
  async createDvrConfig(params: Partial<DvrConfig>): Promise<DvrConfig> {
    return this.post<DvrConfig>('/api/dvr/config/create', params);
  }

  // ========================================
  // Config Endpoints (5)
  // ========================================

  /**
   * Load configuration tree
   * @param node - Optional node UUID to load (root if not specified)
   * @returns Configuration node tree
   */
  async loadConfig(node?: string): Promise<ConfigNode> {
    return this.request<ConfigNode>('/api/config/load', node ? { node } : undefined);
  }

  /**
   * Save configuration changes
   * @param params - Configuration updates
   */
  async saveConfig(params: ConfigSaveParams): Promise<void> {
    await this.post<void>('/api/config/save', params);
  }

  /**
   * Get server capabilities
   * @returns Server capabilities
   */
  async getServerCapabilities(): Promise<ServerCapabilities> {
    const serverInfo = await this.request<ServerInfo>('/api/serverinfo');
    return {
      entries: serverInfo.capabilities || [],
    };
  }

  /**
   * Get server information
   * @returns Server info
   */
  async getServerInfo(): Promise<ServerInfo> {
    return this.request<ServerInfo>('/api/serverinfo');
  }

  /**
   * Get DVR configuration grid
   * @deprecated Use {@link getDvrConfigGrid} instead
   * @param params - Grid query parameters
   * @returns Paginated DVR configs
   */
  async getConfigDvrGrid(params?: DvrConfigGridParams): Promise<DvrConfigGridResponse> {
    return this.getDvrConfigGrid(params);
  }

  // ========================================
  // Status Endpoints (9)
  // ========================================

  /**
   * Get active connections
   * @returns List of active connections
   */
  async getConnections(): Promise<ConnectionsResponse> {
    return this.request<ConnectionsResponse>('/api/status/connections');
  }

  /**
   * Get active subscriptions
   * @returns List of active subscriptions
   */
  async getSubscriptions(): Promise<SubscriptionsResponse> {
    return this.request<SubscriptionsResponse>('/api/status/subscriptions');
  }

  /**
   * Get server activity status (for power management)
   * @returns Activity status
   */
  async getActivity(): Promise<ActivityStatusResponse> {
    return this.request<ActivityStatusResponse>('/api/status/activity');
  }

  /**
   * Get input/adapter status
   * @returns List of inputs with signal status
   */
  async getInputs(): Promise<InputsResponse> {
    return this.request<InputsResponse>('/api/status/inputs');
  }

  /**
   * Clear input statistics
   * @param params - Optional input UUID (clears all if not specified)
   */
  async clearInputStats(params?: InputStatsClearParams): Promise<void> {
    await this.post<void>('/api/status/inputclrstats', params);
  }

  /**
   * Cancel/disconnect an active connection
   * @param params - Connection ID to cancel
   */
  async cancelConnection(params: ConnectionCancelParams): Promise<void> {
    await this.post<void>('/api/status/connections/cancel', params);
  }

  /**
   * Get service status grid
   * @returns Service status information
   */
  async getServiceGrid(): Promise<ServiceGridResponse> {
    return this.request<ServiceGridResponse>('/api/mpegts/service/grid');
  }

  /**
   * Get system logs
   * @param params - Log query parameters
   * @returns System log entries
   */
  async getLog(params?: LogQueryParams): Promise<LogResponse> {
    return this.request<LogResponse>('/api/log', params ? { ...params } : undefined);
  }

  /**
   * Get server status (deprecated - use getServerInfo instead)
   * @deprecated This endpoint was removed from the OpenAPI spec
   */
  async getServerStatus(): Promise<ServerInfo> {
    console.warn('getServerStatus() is deprecated, use getServerInfo() instead');
    return this.getServerInfo();
  }
}
