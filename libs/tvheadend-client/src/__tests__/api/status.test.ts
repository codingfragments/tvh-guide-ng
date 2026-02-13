/**
 * Tests for Status API endpoints
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TVHeadendClient } from '../../client.js';
import {
  mockConnectionsResponse,
  mockSubscriptionsResponse,
  mockInputsResponse,
  mockServerInfo,
} from '../__mocks__/responses.js';

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

import fetch from 'node-fetch';
const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;

describe('Status API', () => {
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

  describe('getConnections', () => {
    it('should fetch active connections', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConnectionsResponse,
      } as any);

      const result = await client.getConnections();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/status/connections'),
        expect.any(Object),
      );
      expect(result).toEqual(mockConnectionsResponse);
      expect(result.entries).toHaveLength(1);
    });
  });

  describe('getSubscriptions', () => {
    it('should fetch active subscriptions', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSubscriptionsResponse,
      } as any);

      const result = await client.getSubscriptions();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/status/subscriptions'),
        expect.any(Object),
      );
      expect(result).toEqual(mockSubscriptionsResponse);
      expect(result.entries).toHaveLength(1);
    });
  });

  describe('getActivity', () => {
    it('should fetch server activity status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entries: [
            {
              activity: 'idle',
              description: 'Server is idle',
              canSleep: true,
            },
          ],
        }),
      } as any);

      const result = await client.getActivity();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/status/activity'),
        expect.any(Object),
      );
      expect(result.entries).toBeDefined();
      expect(result.entries[0].activity).toBe('idle');
    });
  });

  describe('getInputs', () => {
    it('should fetch input/adapter status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInputsResponse,
      } as any);

      const result = await client.getInputs();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/status/inputs'),
        expect.any(Object),
      );
      expect(result).toEqual(mockInputsResponse);
      expect(result.entries).toHaveLength(1);
    });
  });

  describe('clearInputStats', () => {
    it('should clear all input statistics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.clearInputStats();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/status/inputclrstats'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    it('should clear specific input statistics', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.clearInputStats({ uuid: 'input-uuid-1' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/status/inputclrstats'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('input-uuid-1'),
        }),
      );
    });
  });

  describe('cancelConnection', () => {
    it('should cancel a connection', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.cancelConnection({ id: 123 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/status/connections/cancel'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('123'),
        }),
      );
    });
  });

  describe('getServiceGrid', () => {
    it('should fetch service status grid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entries: [],
          total: 0,
          start: 0,
          limit: 50,
        }),
      } as any);

      const result = await client.getServiceGrid();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/mpegts/service/grid'),
        expect.any(Object),
      );
      expect(result).toBeDefined();
    });
  });

  describe('getLog', () => {
    it('should fetch system logs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entries: [
            {
              time: 1704067200,
              severity: 'INFO',
              subsystem: 'epggrab',
              message: 'EPG update completed',
            },
          ],
          total: 1,
        }),
      } as any);

      const result = await client.getLog({ limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/log'),
        expect.any(Object),
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object),
      );
      expect(result.entries).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should support log level filtering', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [], total: 0 }),
      } as any);

      await client.getLog({ level: 'ERROR' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('level=ERROR'),
        expect.any(Object),
      );
    });
  });

  describe('getServerStatus', () => {
    it('should fetch server status (deprecated)', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockServerInfo,
      } as any);

      const result = await client.getServerStatus();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('deprecated'),
      );
      expect(result).toEqual(mockServerInfo);

      consoleWarnSpy.mockRestore();
    });
  });
});
