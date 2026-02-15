import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createApp } from '../server.js';
import { EpgStore } from '../store.js';
import { SearchIndex } from '../search.js';
import { PiconIndex } from '../picon.js';
import type { RefreshScheduler } from '../scheduler.js';
import type { EpgEvent } from '@tvh-guide/tvheadend-client';

function makeEvent(overrides: Partial<EpgEvent> = {}): EpgEvent {
  return {
    eventId: 1,
    channelUuid: 'ch-uuid-1',
    channelName: 'Das Erste HD',
    channelNumber: 1,
    start: 1700000000,
    stop: 1700003600,
    duration: 3600,
    title: 'Tagesschau',
    contentType: 16,
    hd: true,
    widescreen: true,
    audioDesc: false,
    subtitled: false,
    ...overrides,
  };
}

function createMockScheduler(overrides: Partial<RefreshScheduler> = {}): RefreshScheduler {
  return {
    isRefreshing: vi.fn().mockReturnValue(false),
    getNextRefreshTime: vi.fn().mockReturnValue(new Date('2026-02-14T11:00:00Z')),
    refresh: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as RefreshScheduler;
}

describe('HTTP Server', () => {
  let store: EpgStore;
  let searchIndex: SearchIndex;
  let scheduler: ReturnType<typeof createMockScheduler>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    store = new EpgStore(':memory:');
    searchIndex = new SearchIndex();
    scheduler = createMockScheduler();
    app = createApp(store, searchIndex, scheduler, 3600);

    // Seed data
    store.replaceAllEvents([
      makeEvent({
        eventId: 1,
        title: 'Tagesschau',
        channelUuid: 'ch-1',
        channelName: 'Das Erste HD',
        start: 1700000000,
        stop: 1700003600,
        contentType: 16,
      }),
      makeEvent({
        eventId: 2,
        title: 'Tatort',
        subtitle: 'Krimi aus Berlin',
        channelUuid: 'ch-1',
        channelName: 'Das Erste HD',
        start: 1700003600,
        stop: 1700009000,
        contentType: 32,
      }),
      makeEvent({
        eventId: 3,
        title: 'Heute Journal',
        channelUuid: 'ch-2',
        channelName: 'ZDF HD',
        start: 1700000000,
        stop: 1700003600,
        contentType: 16,
      }),
    ]);
    store.replaceAllChannels([
      { uuid: 'ch-1', name: 'Das Erste HD', number: 1, enabled: true },
      { uuid: 'ch-2', name: 'ZDF HD', number: 2, enabled: true },
    ]);
    store.updateSyncStatus('refreshing');
    store.updateSyncComplete(3, 2);
    searchIndex.rebuild(store);
  });

  afterEach(() => {
    store.close();
  });

  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const res = await app.request('/api/health');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.status).toBe('healthy');
      expect(body.totalEvents).toBe(3);
      expect(body.totalChannels).toBe(2);
      expect(body.refreshStatus).toBe('idle');
      expect(body.lastRefreshDuration).toBeGreaterThanOrEqual(0);
      expect(body.nextRefresh).toBe('2026-02-14T11:00:00.000Z');
    });

    it('should return error status when no events', async () => {
      const emptyStore = new EpgStore(':memory:');
      const emptyApp = createApp(emptyStore, searchIndex, scheduler, 3600);
      const res = await emptyApp.request('/api/health');
      const body = await res.json();
      expect(body.status).toBe('error');
      emptyStore.close();
    });
  });

  describe('GET /api/events/search', () => {
    it('should return 400 without q param', async () => {
      const res = await app.request('/api/events/search');
      expect(res.status).toBe(400);
    });

    it('should return matching events', async () => {
      const res = await app.request('/api/events/search?q=Tagesschau');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.length).toBeGreaterThanOrEqual(1);
      expect(body.data[0].event.title).toBe('Tagesschau');
      expect(body.data[0].score).toBeGreaterThan(0);
      expect(body.meta.totalEvents).toBe(3);
    });

    it('should filter by channel number', async () => {
      const res = await app.request('/api/events/search?q=Tagesschau&channel=2');
      expect(res.status).toBe(200);
      const body = await res.json();
      // Tagesschau is on ch-1, not ch-2 — but "Heute Journal" might match partially
      // The search is fuzzy so results may vary, but ch-1 results should be filtered out
      for (const r of body.data) {
        expect(r.event.channelUuid).toBe('ch-2');
      }
    });

    it('should filter by channel UUID', async () => {
      const res = await app.request('/api/events/search?q=Tagesschau&channel=ch-1');
      expect(res.status).toBe(200);
      const body = await res.json();
      for (const r of body.data) {
        expect(r.event.channelUuid).toBe('ch-1');
      }
    });

    it('should return 404 for unknown channel', async () => {
      const res = await app.request('/api/events/search?q=test&channel=nonexistent');
      expect(res.status).toBe(404);
    });

    it('should filter by genre', async () => {
      const res = await app.request('/api/events/search?q=Tatort&genre=32');
      expect(res.status).toBe(200);
      const body = await res.json();
      for (const r of body.data) {
        expect(r.event.contentType).toBe(32);
      }
    });

    it('should return empty data for no matches', async () => {
      const res = await app.request('/api/events/search?q=zzzzxyz');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const res = await app.request('/api/events/search?q=Tagesschau&limit=1');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/events/timerange', () => {
    it('should return 400 without start and stop', async () => {
      const res = await app.request('/api/events/timerange');
      expect(res.status).toBe(400);
    });

    it('should return events in timerange', async () => {
      const res = await app.request('/api/events/timerange?start=1699999000&stop=1700004000');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.length).toBe(3);
    });

    it('should filter by channel', async () => {
      const res = await app.request('/api/events/timerange?start=1699999000&stop=1700004000&channel=1');
      expect(res.status).toBe(200);
      const body = await res.json();
      for (const event of body.data) {
        expect(event.channelUuid).toBe('ch-1');
      }
    });

    it('should filter by genre', async () => {
      const res = await app.request('/api/events/timerange?start=1699999000&stop=1700010000&genre=32');
      expect(res.status).toBe(200);
      const body = await res.json();
      for (const event of body.data) {
        expect(event.contentType).toBe(32);
      }
    });

    it('should return 404 for unknown channel', async () => {
      const res = await app.request('/api/events/timerange?start=0&stop=9999999999&channel=nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/events/:eventId', () => {
    it('should return a single event', async () => {
      const res = await app.request('/api/events/1');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.eventId).toBe(1);
      expect(body.data.title).toBe('Tagesschau');
    });

    it('should return 404 for unknown event', async () => {
      const res = await app.request('/api/events/99999');
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid event ID', async () => {
      const res = await app.request('/api/events/abc');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/channels', () => {
    it('should return all channels', async () => {
      const res = await app.request('/api/channels');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data).toHaveLength(2);
      expect(body.data[0].name).toBe('Das Erste HD');
    });
  });

  describe('POST /api/cache/refresh', () => {
    it('should trigger refresh', async () => {
      const res = await app.request('/api/cache/refresh', { method: 'POST' });
      expect(res.status).toBe(202);
      expect(scheduler.refresh).toHaveBeenCalled();
    });

    it('should return 409 if already refreshing', async () => {
      (scheduler.isRefreshing as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const res = await app.request('/api/cache/refresh', { method: 'POST' });
      expect(res.status).toBe(409);
    });
  });

  describe('Picon endpoints (no piconIndex)', () => {
    it('should return 503 for /api/picon/channel when picons not configured', async () => {
      const res = await app.request('/api/picon/channel/Das%20Erste%20HD');
      expect(res.status).toBe(503);
      const body = await res.json();
      expect(body.error).toContain('not configured');
    });

    it('should return 503 for /api/picon/srp when picons not configured', async () => {
      const res = await app.request('/api/picon/srp/1D5_B_1_130000');
      expect(res.status).toBe(503);
    });
  });
});

describe('Picon endpoints (with piconIndex)', () => {
  let piconFixturePath: string;
  let piconIndex: PiconIndex;
  let piconApp: ReturnType<typeof createApp>;
  let piconStore: EpgStore;

  beforeAll(() => {
    piconFixturePath = join(tmpdir(), `picon-server-test-${Date.now()}`);
    const logosDir = join(piconFixturePath, 'logos');
    mkdirSync(logosDir, { recursive: true });

    writeFileSync(
      join(piconFixturePath, 'snp.index'),
      ['daserstehd=daserste', 'zdfhd=zdf'].join('\n'),
    );
    writeFileSync(
      join(piconFixturePath, 'srp.index'),
      ['1D5_B_1_130000=daserste'].join('\n'),
    );
    writeFileSync(join(logosDir, 'daserste.default.svg'), '<svg>daserste</svg>');
    writeFileSync(join(logosDir, 'zdf.default.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    piconIndex = new PiconIndex(piconFixturePath);
  });

  afterAll(() => {
    rmSync(piconFixturePath, { recursive: true, force: true });
  });

  beforeEach(() => {
    piconStore = new EpgStore(':memory:');
    const searchIndex = new SearchIndex();
    const scheduler = createMockScheduler();
    piconApp = createApp(piconStore, searchIndex, scheduler, 3600, piconIndex);
  });

  afterEach(() => {
    piconStore.close();
  });

  describe('GET /api/picon/channel/:channelName', () => {
    it('should return SVG with correct headers', async () => {
      const res = await piconApp.request('/api/picon/channel/Das%20Erste%20HD');
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('image/svg+xml');
      expect(res.headers.get('Cache-Control')).toBe('public, max-age=86400, stale-while-revalidate=604800');
      const body = await res.text();
      expect(body).toContain('<svg>');
    });

    it('should return PNG with correct content type', async () => {
      const res = await piconApp.request('/api/picon/channel/ZDF%20HD');
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('image/png');
    });

    it('should return 404 for unknown channel', async () => {
      const res = await piconApp.request('/api/picon/channel/NonexistentChannel');
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid variant', async () => {
      const res = await piconApp.request('/api/picon/channel/Das%20Erste%20HD?variant=neon');
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toContain('Invalid variant');
    });
  });

  describe('GET /api/picon/srp/:serviceRef', () => {
    it('should return image by service reference', async () => {
      const res = await piconApp.request('/api/picon/srp/1D5_B_1_130000');
      expect(res.status).toBe(200);
      expect(res.headers.get('Content-Type')).toBe('image/svg+xml');
    });

    it('should return 404 for unknown service reference', async () => {
      const res = await piconApp.request('/api/picon/srp/AAAA_B_1_130000');
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid variant', async () => {
      const res = await piconApp.request('/api/picon/srp/1D5_B_1_130000?variant=rainbow');
      expect(res.status).toBe(400);
    });
  });
});
