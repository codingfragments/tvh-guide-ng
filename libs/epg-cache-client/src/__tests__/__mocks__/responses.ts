import type {
  HealthResponse,
  ApiResponse,
  SearchResult,
  CachedChannel,
  RefreshAcceptedResponse,
} from '../../types.js';
import type { EpgEvent } from '@tvh-guide/tvheadend-client';

export const mockEpgEvent: EpgEvent = {
  eventId: 12345,
  channelUuid: 'abc-def-123',
  channelName: 'Das Erste HD',
  start: 1704067200,
  stop: 1704070800,
  title: 'Tagesschau',
  subtitle: 'Nachrichten',
  description: 'Die Nachrichten der ARD',
  contentType: 16,
};

export const mockHealthResponse: HealthResponse = {
  status: 'healthy',
  cacheAge: 542,
  lastRefresh: '2026-02-14T10:00:00.000Z',
  refreshStatus: 'idle',
  totalEvents: 48521,
  totalChannels: 150,
  lastRefreshDuration: 12.5,
  nextRefresh: '2026-02-14T11:00:00.000Z',
};

export const mockSearchResponse: ApiResponse<SearchResult[]> = {
  data: [
    { score: 15.2, event: mockEpgEvent },
  ],
  meta: {
    cacheAge: 120,
    lastRefresh: '2026-02-14T10:00:00.000Z',
    refreshStatus: 'idle',
    totalEvents: 48521,
  },
};

export const mockEmptySearchResponse: ApiResponse<SearchResult[]> = {
  data: [],
  meta: {
    cacheAge: 120,
    lastRefresh: '2026-02-14T10:00:00.000Z',
    refreshStatus: 'idle',
    totalEvents: 48521,
  },
};

export const mockTimerangeResponse: ApiResponse<EpgEvent[]> = {
  data: [mockEpgEvent],
  meta: {
    cacheAge: 120,
    lastRefresh: '2026-02-14T10:00:00.000Z',
    refreshStatus: 'idle',
    totalEvents: 48521,
  },
};

export const mockEventResponse: ApiResponse<EpgEvent> = {
  data: mockEpgEvent,
  meta: {
    cacheAge: 120,
    lastRefresh: '2026-02-14T10:00:00.000Z',
    refreshStatus: 'idle',
    totalEvents: 48521,
  },
};

export const mockCachedChannel: CachedChannel = {
  uuid: 'abc-def-123',
  enabled: true,
  name: 'Das Erste HD',
  number: 1,
  icon: 'https://example.com/icon.png',
  iconPublicUrl: 'https://example.com/icon.png',
};

export const mockChannelsResponse: ApiResponse<CachedChannel[]> = {
  data: [mockCachedChannel],
  meta: {
    cacheAge: 120,
    lastRefresh: '2026-02-14T10:00:00.000Z',
    refreshStatus: 'idle',
    totalEvents: 48521,
  },
};

export const mockRefreshResponse: RefreshAcceptedResponse = {
  message: 'Refresh started',
};
