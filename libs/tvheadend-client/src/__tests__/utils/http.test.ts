/**
 * Tests for HTTP utilities
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { request, buildUrl, serializeFilter } from '../../utils/http.js';
import {
  TVHeadendError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BadRequestError,
  NetworkError,
} from '../../utils/errors.js';

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

import fetch from 'node-fetch';
const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;

describe('HTTP Utilities', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('request', () => {
    it('should make successful request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as any);

      const result = await request<{ success: boolean }>('http://localhost:9981/api/test', {});

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:9981/api/test', {});
    });

    it('should throw NetworkError on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(request('http://localhost:9981/api/test', {})).rejects.toThrow(
        'Network request failed: Connection refused',
      );
    });

    it('should throw BadRequestError on 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid parameters',
      } as any);

      await expect(request('http://localhost:9981/api/test', {})).rejects.toThrow(
        'Invalid parameters',
      );
    });

    it('should throw AuthenticationError on 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid credentials',
      } as any);

      await expect(request('http://localhost:9981/api/test', {})).rejects.toThrow(
        AuthenticationError,
      );
    });

    it('should throw AuthorizationError on 403', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => 'Permission denied',
      } as any);

      await expect(request('http://localhost:9981/api/test', {})).rejects.toThrow(
        AuthorizationError,
      );
    });

    it('should throw NotFoundError on 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Resource not found',
      } as any);

      await expect(request('http://localhost:9981/api/test', {})).rejects.toThrow(NotFoundError);
    });

    it('should throw TVHeadendError on other HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error',
      } as any);

      await expect(request('http://localhost:9981/api/test', {})).rejects.toThrow(
        'HTTP 500: Server error',
      );
    });

    it('should handle empty error text', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => '',
      } as any);

      await expect(request('http://localhost:9981/api/test', {})).rejects.toThrow('Bad request');
    });

    it('should handle error text retrieval failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => {
          throw new Error('Cannot read response');
        },
      } as any);

      await expect(request('http://localhost:9981/api/test', {})).rejects.toThrow(
        'HTTP 500: Unknown error',
      );
    });

    it('should throw TVHeadendError on JSON parse failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as any);

      await expect(request('http://localhost:9981/api/test', {})).rejects.toThrow(
        'Failed to parse response',
      );
    });

    it('should handle non-Error exceptions in network failure', async () => {
      mockFetch.mockRejectedValueOnce('String error');

      await expect(request('http://localhost:9981/api/test', {})).rejects.toThrow(
        'Network request failed: Unknown error',
      );
    });

    it('should handle non-Error exceptions in JSON parse', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw 'String error';
        },
      } as any);

      await expect(request('http://localhost:9981/api/test', {})).rejects.toThrow('Unknown error');
    });
  });

  describe('buildUrl', () => {
    it('should build URL without parameters', () => {
      const url = buildUrl('http://localhost:9981', '/api/test');
      expect(url).toBe('http://localhost:9981/api/test');
    });

    it('should build URL with parameters', () => {
      const url = buildUrl('http://localhost:9981', '/api/test', {
        limit: 10,
        sort: 'name',
      });
      expect(url).toContain('/api/test');
      expect(url).toContain('limit=10');
      expect(url).toContain('sort=name');
    });

    it('should skip undefined parameters', () => {
      const url = buildUrl('http://localhost:9981', '/api/test', {
        limit: 10,
        sort: undefined,
      });
      expect(url).toContain('limit=10');
      expect(url).not.toContain('sort');
    });

    it('should handle boolean parameters', () => {
      const url = buildUrl('http://localhost:9981', '/api/test', {
        enabled: true,
        disabled: false,
      });
      expect(url).toContain('enabled=true');
      expect(url).toContain('disabled=false');
    });

    it('should handle number parameters', () => {
      const url = buildUrl('http://localhost:9981', '/api/test', {
        id: 123,
        count: 0,
      });
      expect(url).toContain('id=123');
      expect(url).toContain('count=0');
    });

    it('should handle empty parameters object', () => {
      const url = buildUrl('http://localhost:9981', '/api/test', {});
      expect(url).toBe('http://localhost:9981/api/test');
    });

    it('should build URL without params argument', () => {
      const url = buildUrl('http://localhost:9981', '/api/test');
      expect(url).toBe('http://localhost:9981/api/test');
    });
  });

  describe('serializeFilter', () => {
    it('should return string filter as-is', () => {
      const result = serializeFilter('simple-filter');
      expect(result).toBe('simple-filter');
    });

    it('should serialize object filter', () => {
      const filter = { field: 'title', type: 'string', value: 'News' };
      const result = serializeFilter(filter);
      expect(result).toBe(JSON.stringify(filter));
      expect(JSON.parse(result)).toEqual(filter);
    });

    it('should serialize array filter', () => {
      const filter = [
        { field: 'title', type: 'string', value: 'News' },
        { field: 'enabled', type: 'boolean', value: true },
      ];
      const result = serializeFilter(filter);
      expect(result).toBe(JSON.stringify(filter));
      expect(JSON.parse(result)).toEqual(filter);
    });
  });
});
