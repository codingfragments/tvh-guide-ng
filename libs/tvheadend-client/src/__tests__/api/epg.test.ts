/**
 * Tests for EPG API endpoints
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TVHeadendClient } from '../../client.js';
import { mockEpgGridResponse, mockEpgEventDetail, mockContentType } from '../__mocks__/responses.js';

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

import fetch from 'node-fetch';
const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;

describe('EPG API', () => {
  let client: TVHeadendClient;

  beforeEach(() => {
    client = new TVHeadendClient({
      baseUrl: 'http://localhost:9981',
      username: 'admin',
      password: 'secret',
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getEpgEventsGrid', () => {
    it('should fetch EPG events grid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEpgGridResponse,
      } as any);

      const result = await client.getEpgEventsGrid({ limit: 10 });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/epg/events/grid'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Basic /),
          }),
        }),
      );
      expect(result).toEqual(mockEpgGridResponse);
    });

    it('should serialize filter parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEpgGridResponse,
      } as any);

      await client.getEpgEventsGrid({
        filter: JSON.stringify({ field: 'title', type: 'string', value: 'News' }),
      });

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('filter='), expect.any(Object));
    });

    it('should support mode parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEpgGridResponse,
      } as any);

      await client.getEpgEventsGrid({ mode: 'now' });

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('mode=now'), expect.any(Object));
    });
  });

  describe('loadEpgEvents', () => {
    it('should load single event by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockEpgEventDetail],
      } as any);

      const result = await client.loadEpgEvents(123456);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/epg/events/load'), expect.any(Object));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('eventId=123456'), expect.any(Object));
      expect(result).toEqual([mockEpgEventDetail]);
    });

    it('should load multiple events by IDs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockEpgEventDetail, mockEpgEventDetail],
      } as any);

      const result = await client.loadEpgEvents([123456, 123457]);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('eventId=123456%2C123457'), expect.any(Object));
      expect(result).toHaveLength(2);
    });
  });

  describe('listContentTypes', () => {
    it('should list content types', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockContentType],
      } as any);

      const result = await client.listContentTypes();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/epg/content_type/list'), expect.any(Object));
      expect(result).toEqual([mockContentType]);
    });
  });

  describe('getAlternativeEvents', () => {
    it('should get alternative events', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockEpgEventDetail],
      } as any);

      const result = await client.getAlternativeEvents(123456);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/epg/events/alternative'),
        expect.any(Object),
      );
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('eventId=123456'), expect.any(Object));
      expect(result).toEqual([mockEpgEventDetail]);
    });
  });

  describe('getRelatedEvents', () => {
    it('should get related events', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [mockEpgEventDetail],
      } as any);

      const result = await client.getRelatedEvents(123456);

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/epg/events/related'), expect.any(Object));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('eventId=123456'), expect.any(Object));
      expect(result).toEqual([mockEpgEventDetail]);
    });
  });

  describe('listEpgBrands', () => {
    it('should list EPG brands (deprecated)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as any);

      const result = await client.listEpgBrands();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/epg/brand/list'), expect.any(Object));
      expect(result).toEqual([]);
    });
  });
});
