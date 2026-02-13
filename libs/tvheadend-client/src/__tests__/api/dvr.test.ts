/**
 * Tests for DVR API endpoints
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TVHeadendClient } from '../../client.js';
import {
  mockDvrGridResponse,
  mockDvrEntry,
  mockDvrAutorecGridResponse,
  mockDvrAutorecEntry,
  mockDvrConfigGridResponse,
  mockDvrConfig,
} from '../__mocks__/responses.js';

// Mock node-fetch
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}));

import fetch from 'node-fetch';
const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;

describe('DVR API', () => {
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

  describe('getDvrEntryGrid', () => {
    it('should fetch DVR entries grid', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrGridResponse,
      } as any);

      const result = await client.getDvrEntryGrid({ limit: 10 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/grid'),
        expect.any(Object),
      );
      expect(result).toEqual(mockDvrGridResponse);
    });
  });

  describe('getDvrEntryGridUpcoming', () => {
    it('should fetch upcoming recordings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrGridResponse,
      } as any);

      const result = await client.getDvrEntryGridUpcoming();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/grid_upcoming'),
        expect.any(Object),
      );
      expect(result).toEqual(mockDvrGridResponse);
    });
  });

  describe('getDvrEntryGridFinished', () => {
    it('should fetch finished recordings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrGridResponse,
      } as any);

      const result = await client.getDvrEntryGridFinished();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/grid_finished'),
        expect.any(Object),
      );
      expect(result).toEqual(mockDvrGridResponse);
    });
  });

  describe('getDvrEntryGridFailed', () => {
    it('should fetch failed recordings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrGridResponse,
      } as any);

      const result = await client.getDvrEntryGridFailed();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/grid_failed'),
        expect.any(Object),
      );
      expect(result).toEqual(mockDvrGridResponse);
    });
  });

  describe('getDvrEntryGridRemoved', () => {
    it('should fetch removed recordings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrGridResponse,
      } as any);

      const result = await client.getDvrEntryGridRemoved();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/grid_removed'),
        expect.any(Object),
      );
      expect(result).toEqual(mockDvrGridResponse);
    });
  });

  describe('getDvrEntryClass', () => {
    it('should fetch DVR entry class metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ caption: 'DVR Entry', properties: [] }),
      } as any);

      const result = await client.getDvrEntryClass();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/class'),
        expect.any(Object),
      );
      expect(result.caption).toBeDefined();
    });
  });

  describe('createDvrEntry', () => {
    it('should create a manual recording', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrEntry,
      } as any);

      const result = await client.createDvrEntry({
        channel: 'channel-uuid',
        start: 1704067200,
        stop: 1704070800,
        title: 'Test Recording',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/create'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test Recording'),
        }),
      );
      expect(result).toEqual(mockDvrEntry);
    });
  });

  describe('createDvrEntryByEvent', () => {
    it('should schedule recording from EPG event', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrEntry,
      } as any);

      const result = await client.createDvrEntryByEvent({ event_id: 123456 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/create_by_event'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('123456'),
        }),
      );
      expect(result).toEqual(mockDvrEntry);
    });
  });

  describe('cancelDvrEntry', () => {
    it('should cancel a recording', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.cancelDvrEntry({ uuid: 'dvr-uuid' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/cancel'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('dvr-uuid'),
        }),
      );
    });
  });

  describe('stopDvrEntry', () => {
    it('should stop an active recording', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.stopDvrEntry({ uuid: 'dvr-uuid' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/stop'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  describe('removeDvrEntry', () => {
    it('should remove a DVR entry', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.removeDvrEntry({ uuid: 'dvr-uuid' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/remove'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  describe('notifyDvrFileMoved', () => {
    it('should notify about file move', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.notifyDvrFileMoved({
        uuid: 'dvr-uuid',
        filename: '/new/path/recording.ts',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/filemoved'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  describe('moveDvrToFinished', () => {
    it('should move DVR entry to finished', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.moveDvrToFinished({ uuid: 'dvr-uuid' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/move/finished'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  describe('moveDvrToFailed', () => {
    it('should move DVR entry to failed', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.moveDvrToFailed({ uuid: 'dvr-uuid' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/move/failed'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  describe('rerecordDvrEntry', () => {
    it('should re-record a failed entry', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.rerecordDvrEntry('dvr-uuid');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/rerecord'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  describe('rerecordAllFailed', () => {
    it('should re-record all failed entries', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as any);

      await client.rerecordAllFailed();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/entry/rerecord/all'),
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });
  });

  describe('getDvrAutorecGrid', () => {
    it('should fetch auto-recording rules', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrAutorecGridResponse,
      } as any);

      const result = await client.getDvrAutorecGrid();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/autorec/grid'),
        expect.any(Object),
      );
      expect(result).toEqual(mockDvrAutorecGridResponse);
    });
  });

  describe('createDvrAutorec', () => {
    it('should create auto-recording rule', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrAutorecEntry,
      } as any);

      const result = await client.createDvrAutorec({
        name: 'Record News',
        title: 'News',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/autorec/create'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Record News'),
        }),
      );
      expect(result).toEqual(mockDvrAutorecEntry);
    });
  });

  describe('createAutorecBySeries', () => {
    it('should create autorec from series', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrAutorecEntry,
      } as any);

      const result = await client.createAutorecBySeries(123456);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/autorec/create_by_series'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('123456'),
        }),
      );
      expect(result).toEqual(mockDvrAutorecEntry);
    });
  });

  describe('getDvrTimerecGrid', () => {
    it('should fetch time-based recording rules', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [], total: 0, start: 0, limit: 50 }),
      } as any);

      const result = await client.getDvrTimerecGrid();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/timerec/grid'),
        expect.any(Object),
      );
      expect(result).toBeDefined();
    });
  });

  describe('getDvrConfigGrid', () => {
    it('should fetch DVR configurations', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrConfigGridResponse,
      } as any);

      const result = await client.getDvrConfigGrid();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/config/grid'),
        expect.any(Object),
      );
      expect(result).toEqual(mockDvrConfigGridResponse);
    });
  });

  describe('getDvrConfigClass', () => {
    it('should fetch DVR config class metadata', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ caption: 'DVR Config', properties: [] }),
      } as any);

      const result = await client.getDvrConfigClass();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/config/class'),
        expect.any(Object),
      );
      expect(result.caption).toBeDefined();
    });
  });

  describe('createDvrConfig', () => {
    it('should create DVR configuration profile', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDvrConfig,
      } as any);

      const result = await client.createDvrConfig({
        name: 'Custom Profile',
        enabled: true,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/dvr/config/create'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Custom Profile'),
        }),
      );
      expect(result).toEqual(mockDvrConfig);
    });
  });
});
