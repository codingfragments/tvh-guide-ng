import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EpgCacheClient } from '../client.js';
import {
  mockHealthResponse,
  mockSearchResponse,
  mockTimerangeResponse,
  mockEventResponse,
  mockChannelsResponse,
  mockRefreshResponse,
} from './__mocks__/responses.js';

function mockFetchResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'OK',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Headers(),
  } as Response;
}

describe('EpgCacheClient', () => {
  let client: EpgCacheClient;

  beforeEach(() => {
    client = new EpgCacheClient({ baseUrl: 'http://localhost:3000' });
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('strips trailing slash from baseUrl', () => {
      const c = new EpgCacheClient({ baseUrl: 'http://localhost:3000/' });
      vi.mocked(fetch).mockResolvedValue(mockFetchResponse(mockHealthResponse));

      c.getHealth();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:3000/api/health'),
        expect.anything(),
      );
    });

    it('uses default timeout when not specified', () => {
      vi.mocked(fetch).mockResolvedValue(mockFetchResponse(mockHealthResponse));

      client.getHealth();

      const callArgs = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
      expect(callArgs.signal).toBeDefined();
    });

    it('uses custom timeout', () => {
      const c = new EpgCacheClient({ baseUrl: 'http://localhost:3000', timeout: 5000 });
      vi.mocked(fetch).mockResolvedValue(mockFetchResponse(mockHealthResponse));

      c.getHealth();

      const callArgs = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
      expect(callArgs.signal).toBeDefined();
    });
  });

  describe('getHealth', () => {
    it('calls GET /api/health and returns HealthResponse', async () => {
      vi.mocked(fetch).mockResolvedValue(mockFetchResponse(mockHealthResponse));

      const result = await client.getHealth();

      expect(result).toEqual(mockHealthResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/health',
        expect.objectContaining({ method: 'GET' }),
      );
    });
  });

  describe('searchEvents', () => {
    it('calls GET /api/events/search with query params', async () => {
      vi.mocked(fetch).mockResolvedValue(mockFetchResponse(mockSearchResponse));

      const result = await client.searchEvents({ q: 'Tagesschau' });

      expect(result).toEqual(mockSearchResponse);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/events/search?q=Tagesschau'),
        expect.anything(),
      );
    });

    it('includes all optional params', async () => {
      vi.mocked(fetch).mockResolvedValue(mockFetchResponse(mockSearchResponse));

      await client.searchEvents({
        q: 'Krimi',
        channel: '1',
        start: 1704067200,
        stop: 1704153600,
        genre: 16,
        limit: 10,
      });

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('q=Krimi');
      expect(calledUrl).toContain('channel=1');
      expect(calledUrl).toContain('start=1704067200');
      expect(calledUrl).toContain('stop=1704153600');
      expect(calledUrl).toContain('genre=16');
      expect(calledUrl).toContain('limit=10');
    });
  });

  describe('getEventsByTimerange', () => {
    it('calls GET /api/events/timerange with required params', async () => {
      vi.mocked(fetch).mockResolvedValue(mockFetchResponse(mockTimerangeResponse));

      const result = await client.getEventsByTimerange({
        start: 1704067200,
        stop: 1704153600,
      });

      expect(result).toEqual(mockTimerangeResponse);
      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('/api/events/timerange');
      expect(calledUrl).toContain('start=1704067200');
      expect(calledUrl).toContain('stop=1704153600');
    });

    it('includes optional params', async () => {
      vi.mocked(fetch).mockResolvedValue(mockFetchResponse(mockTimerangeResponse));

      await client.getEventsByTimerange({
        start: 1704067200,
        stop: 1704153600,
        channel: 'abc-123',
        genre: 16,
        limit: 50,
      });

      const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string;
      expect(calledUrl).toContain('channel=abc-123');
      expect(calledUrl).toContain('genre=16');
      expect(calledUrl).toContain('limit=50');
    });
  });

  describe('getEvent', () => {
    it('calls GET /api/events/:eventId', async () => {
      vi.mocked(fetch).mockResolvedValue(mockFetchResponse(mockEventResponse));

      const result = await client.getEvent(12345);

      expect(result).toEqual(mockEventResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/events/12345',
        expect.anything(),
      );
    });
  });

  describe('getChannels', () => {
    it('calls GET /api/channels', async () => {
      vi.mocked(fetch).mockResolvedValue(mockFetchResponse(mockChannelsResponse));

      const result = await client.getChannels();

      expect(result).toEqual(mockChannelsResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/channels',
        expect.anything(),
      );
    });
  });

  describe('triggerRefresh', () => {
    it('calls POST /api/cache/refresh', async () => {
      vi.mocked(fetch).mockResolvedValue(mockFetchResponse(mockRefreshResponse, 202));

      const result = await client.triggerRefresh();

      expect(result).toEqual(mockRefreshResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/cache/refresh',
        expect.objectContaining({ method: 'POST' }),
      );
    });
  });
});
