import { request, requestBinary, buildUrl } from './http.js';
import type {
  EpgCacheClientConfig,
  HealthResponse,
  ApiResponse,
  SearchParams,
  SearchResult,
  TimerangeParams,
  EpgEvent,
  CachedChannel,
  RefreshAcceptedResponse,
  PiconByChannelParams,
  PiconByServiceRefParams,
} from './types.js';

const DEFAULT_TIMEOUT = 10_000;

export class EpgCacheClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: EpgCacheClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
  }

  /** GET /api/health */
  async getHealth(): Promise<HealthResponse> {
    const url = buildUrl(this.baseUrl, '/api/health');
    return request<HealthResponse>(url, { timeout: this.timeout });
  }

  /** GET /api/events/search?q=...&channel=...&start=...&stop=...&genre=...&limit=... */
  async searchEvents(params: SearchParams): Promise<ApiResponse<SearchResult[]>> {
    const url = buildUrl(this.baseUrl, '/api/events/search', {
      q: params.q,
      channel: params.channel,
      start: params.start,
      stop: params.stop,
      genre: params.genre,
      limit: params.limit,
    });
    return request<ApiResponse<SearchResult[]>>(url, { timeout: this.timeout });
  }

  /** GET /api/events/timerange?start=...&stop=...&channel=...&genre=...&limit=... */
  async getEventsByTimerange(params: TimerangeParams): Promise<ApiResponse<EpgEvent[]>> {
    const url = buildUrl(this.baseUrl, '/api/events/timerange', {
      start: params.start,
      stop: params.stop,
      channel: params.channel,
      genre: params.genre,
      limit: params.limit,
    });
    return request<ApiResponse<EpgEvent[]>>(url, { timeout: this.timeout });
  }

  /** GET /api/events/:eventId */
  async getEvent(eventId: number): Promise<ApiResponse<EpgEvent>> {
    const url = buildUrl(this.baseUrl, `/api/events/${String(eventId)}`);
    return request<ApiResponse<EpgEvent>>(url, { timeout: this.timeout });
  }

  /** GET /api/channels */
  async getChannels(): Promise<ApiResponse<CachedChannel[]>> {
    const url = buildUrl(this.baseUrl, '/api/channels');
    return request<ApiResponse<CachedChannel[]>>(url, { timeout: this.timeout });
  }

  /** POST /api/cache/refresh */
  async triggerRefresh(): Promise<RefreshAcceptedResponse> {
    const url = buildUrl(this.baseUrl, '/api/cache/refresh');
    return request<RefreshAcceptedResponse>(url, {
      method: 'POST',
      timeout: this.timeout,
    });
  }

  /** GET /api/picon/channel/:channelName — returns raw Response with image body */
  async getPiconByChannelName(params: PiconByChannelParams): Promise<Response> {
    const url = buildUrl(this.baseUrl, `/api/picon/channel/${encodeURIComponent(params.channelName)}`, {
      variant: params.variant,
    });
    return requestBinary(url, { timeout: this.timeout });
  }

  /** GET /api/picon/srp/:serviceRef — returns raw Response with image body */
  async getPiconByServiceRef(params: PiconByServiceRefParams): Promise<Response> {
    const url = buildUrl(this.baseUrl, `/api/picon/srp/${encodeURIComponent(params.serviceRef)}`, {
      variant: params.variant,
    });
    return requestBinary(url, { timeout: this.timeout });
  }

  /** Build a URL for use in <img src> — picon by channel name */
  getPiconUrlByChannelName(params: PiconByChannelParams): string {
    return buildUrl(this.baseUrl, `/api/picon/channel/${encodeURIComponent(params.channelName)}`, {
      variant: params.variant,
    });
  }

  /** Build a URL for use in <img src> — picon by service reference */
  getPiconUrlByServiceRef(params: PiconByServiceRefParams): string {
    return buildUrl(this.baseUrl, `/api/picon/srp/${encodeURIComponent(params.serviceRef)}`, {
      variant: params.variant,
    });
  }
}
