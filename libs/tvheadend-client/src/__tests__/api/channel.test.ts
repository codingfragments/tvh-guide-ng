/**
 * Tests for Channel API endpoints
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TVHeadendClient } from '../../client.js';
import {
  mockChannelGridResponse,
  mockChannel,
  mockChannelTagGridResponse,
  mockChannelTag,
} from '../__mocks__/responses.js';

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

import fetch from 'node-fetch';
const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;

describe('Channel API', () => {
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

  describe('getChannelGrid', () => {
    it('should fetch channels grid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannelGridResponse,
      } as any);

      const result = await client.getChannelGrid({ limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/channel/grid'), expect.any(Object));
      expect(result).toEqual(mockChannelGridResponse);
    });

    it('should support sorting', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannelGridResponse,
      } as any);

      await client.getChannelGrid({ sort: 'number', dir: 'ASC' });

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('sort=number'), expect.any(Object));
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('dir=ASC'), expect.any(Object));
    });
  });

  describe('getChannelList', () => {
    it('should fetch channel list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [mockChannel] }),
      } as any);

      const result = await client.getChannelList();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/channel/list'), expect.any(Object));
      expect(result.entries).toBeDefined();
    });
  });

  describe('createChannel', () => {
    it('should create a new channel', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannel,
      } as any);

      const result = await client.createChannel({
        name: 'Test Channel',
        enabled: true,
        number: 999,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/channel/create'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Channel'),
        }),
      );
      expect(result).toEqual(mockChannel);
    });
  });

  describe('getChannelClass', () => {
    it('should fetch channel class metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ caption: 'Channel', properties: [] }),
      } as any);

      const result = await client.getChannelClass();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/channel/class'), expect.any(Object));
      expect(result.caption).toBeDefined();
    });
  });

  describe('renameChannel', () => {
    it('should rename a channel', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.renameChannel(101, 'New Channel Name');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/channel/rename'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New Channel Name'),
        }),
      );
    });
  });

  describe('getChannelTagGrid', () => {
    it('should fetch channel tags grid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannelTagGridResponse,
      } as any);

      const result = await client.getChannelTagGrid();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/channeltag/grid'), expect.any(Object));
      expect(result).toEqual(mockChannelTagGridResponse);
    });
  });

  describe('getChannelTagList', () => {
    it('should fetch channel tag list', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [mockChannelTag] }),
      } as any);

      const result = await client.getChannelTagList();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/channeltag/list'), expect.any(Object));
      expect(result.entries).toBeDefined();
    });
  });

  describe('getChannelTagClass', () => {
    it('should fetch channel tag class metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ caption: 'Channel Tag', properties: [] }),
      } as any);

      const result = await client.getChannelTagClass();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/channeltag/class'), expect.any(Object));
      expect(result.caption).toBeDefined();
    });
  });

  describe('createChannelTag', () => {
    it('should create a new channel tag', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockChannelTag,
      } as any);

      const result = await client.createChannelTag({
        name: 'Test Tag',
        enabled: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/channeltag/create'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Tag'),
        }),
      );
      expect(result).toEqual(mockChannelTag);
    });
  });

  describe('listChannelCategories', () => {
    it('should list channel categories', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ key: 'movie', val: 'Movies' }],
      } as any);

      const result = await client.listChannelCategories();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/channel/category/list'), expect.any(Object));
      expect(result).toBeInstanceOf(Array);
    });
  });
});
