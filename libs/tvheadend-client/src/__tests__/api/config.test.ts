/**
 * Tests for Config API endpoints
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TVHeadendClient } from '../../client.js';
import { mockServerInfo } from '../__mocks__/responses.js';

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

import fetch from 'node-fetch';
const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;

describe('Config API', () => {
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

  describe('loadConfig', () => {
    it('should load configuration tree', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uuid: 'root',
          type: 'node',
          children: [],
        }),
      } as any);

      const result = await client.loadConfig();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/config/load'), expect.any(Object));
      expect(result.uuid).toBeDefined();
    });

    it('should load specific config node', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          uuid: 'node-1',
          type: 'node',
        }),
      } as any);

      const result = await client.loadConfig('node-1');

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('node=node-1'), expect.any(Object));
      expect(result.uuid).toBe('node-1');
    });
  });

  describe('saveConfig', () => {
    it('should save configuration changes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.saveConfig({
        node: 'node-1',
        conf: { setting1: 'value1' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/config/save'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('node-1'),
        }),
      );
    });
  });

  describe('getServerCapabilities', () => {
    it('should fetch server capabilities and extract from ServerInfo', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerInfo,
      } as any);

      const result = await client.getServerCapabilities();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/serverinfo'), expect.any(Object));
      expect(result).toBeDefined();
      expect(result.entries).toEqual(mockServerInfo.capabilities);
    });

    it('should handle missing capabilities in ServerInfo', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Test Server',
          version: '4.3',
          sw_version: '4.3.0',
          api_version: 20,
          // no capabilities property
        }),
      } as any);

      const result = await client.getServerCapabilities();

      expect(result.entries).toEqual([]);
    });
  });

  describe('getServerInfo', () => {
    it('should fetch server information', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerInfo,
      } as any);

      const result = await client.getServerInfo();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/serverinfo'), expect.any(Object));
      expect(result).toEqual(mockServerInfo);
      expect(result.name).toBe('Test TVHeadend Server');
      expect(result.api_version).toBe(20);
    });
  });

  describe('getConfigDvrGrid', () => {
    it('should fetch DVR config grid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [], total: 0, start: 0, limit: 50 }),
      } as any);

      const result = await client.getConfigDvrGrid();

      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/dvr/config/grid'), expect.any(Object));
      expect(result).toBeDefined();
    });
  });
});
