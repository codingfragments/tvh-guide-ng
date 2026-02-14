import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EpgStore } from '../store.js';
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
    subtitle: 'Nachrichten',
    summary: 'Die Nachrichtensendung',
    description: 'Aktuelle Nachrichten aus aller Welt',
    genre: [16, 32],
    contentType: 16,
    hd: true,
    widescreen: true,
    audioDesc: false,
    subtitled: false,
    ...overrides,
  };
}

describe('EpgStore', () => {
  let store: EpgStore;

  beforeEach(() => {
    store = new EpgStore(':memory:');
  });

  afterEach(() => {
    store.close();
  });

  describe('events', () => {
    it('should store and retrieve events', () => {
      const events = [makeEvent(), makeEvent({ eventId: 2, title: 'Tatort', start: 1700003600, stop: 1700009000 })];
      store.replaceAllEvents(events);

      const result = store.getEventById(1);
      expect(result).toBeDefined();
      expect(result!.title).toBe('Tagesschau');
      expect(result!.channelUuid).toBe('ch-uuid-1');
      expect(result!.genre).toEqual([16, 32]);
      expect(result!.hd).toBe(true);
      expect(result!.audioDesc).toBe(false);
    });

    it('should replace all events atomically', () => {
      store.replaceAllEvents([makeEvent()]);
      expect(store.getEventCount()).toBe(1);

      store.replaceAllEvents([makeEvent({ eventId: 10 }), makeEvent({ eventId: 11 })]);
      expect(store.getEventCount()).toBe(2);
      expect(store.getEventById(1)).toBeUndefined();
      expect(store.getEventById(10)).toBeDefined();
    });

    it('should query events by timerange', () => {
      store.replaceAllEvents([
        makeEvent({ eventId: 1, start: 1000, stop: 2000 }),
        makeEvent({ eventId: 2, start: 2000, stop: 3000 }),
        makeEvent({ eventId: 3, start: 3000, stop: 4000 }),
      ]);

      // Query overlapping with event 1 and 2
      const results = store.getEventsByTimerange(1500, 2500);
      expect(results).toHaveLength(2);
      expect(results.map((e) => e.eventId)).toEqual([1, 2]);
    });

    it('should filter timerange by channel', () => {
      store.replaceAllEvents([
        makeEvent({ eventId: 1, channelUuid: 'ch-1', start: 1000, stop: 2000 }),
        makeEvent({ eventId: 2, channelUuid: 'ch-2', start: 1000, stop: 2000 }),
      ]);

      const results = store.getEventsByTimerange(500, 2500, { channelUuid: 'ch-1' });
      expect(results).toHaveLength(1);
      expect(results[0].eventId).toBe(1);
    });

    it('should filter timerange by content type', () => {
      store.replaceAllEvents([
        makeEvent({ eventId: 1, contentType: 16, start: 1000, stop: 2000 }),
        makeEvent({ eventId: 2, contentType: 32, start: 1000, stop: 2000 }),
      ]);

      const results = store.getEventsByTimerange(500, 2500, { contentType: 16 });
      expect(results).toHaveLength(1);
      expect(results[0].eventId).toBe(1);
    });

    it('should limit timerange results', () => {
      store.replaceAllEvents([
        makeEvent({ eventId: 1, start: 1000, stop: 2000 }),
        makeEvent({ eventId: 2, start: 1500, stop: 2500 }),
        makeEvent({ eventId: 3, start: 1800, stop: 2800 }),
      ]);

      const results = store.getEventsByTimerange(500, 3000, { limit: 2 });
      expect(results).toHaveLength(2);
    });

    it('should get events by ids', () => {
      store.replaceAllEvents([makeEvent({ eventId: 1 }), makeEvent({ eventId: 2 }), makeEvent({ eventId: 3 })]);

      const results = store.getEventsByIds([1, 3]);
      expect(results).toHaveLength(2);
      expect(results.map((e) => e.eventId).sort()).toEqual([1, 3]);
    });

    it('should return empty array for empty ids', () => {
      expect(store.getEventsByIds([])).toEqual([]);
    });

    it('should handle events with null optional fields', () => {
      const event = makeEvent({
        subtitle: undefined,
        summary: undefined,
        description: undefined,
        genre: undefined,
        contentType: undefined,
        hd: undefined,
      });
      store.replaceAllEvents([event]);

      const result = store.getEventById(1)!;
      expect(result.subtitle).toBeNull();
      expect(result.genre).toBeUndefined();
      expect(result.hd).toBe(false);
    });
  });

  describe('channels', () => {
    it('should store and retrieve channels', () => {
      store.replaceAllChannels([
        {
          uuid: 'ch-1',
          name: 'Das Erste HD',
          number: 1,
          enabled: true,
          icon: '/icon1.png',
          iconPublicUrl: 'http://example.com/icon1.png',
        },
        { uuid: 'ch-2', name: 'ZDF HD', number: 2 },
      ]);

      const channels = store.getAllChannels();
      expect(channels).toHaveLength(2);
      expect(channels[0].name).toBe('Das Erste HD');
      expect(channels[0].number).toBe(1);
      expect(channels[1].name).toBe('ZDF HD');
    });

    it('should look up channel by UUID', () => {
      store.replaceAllChannels([{ uuid: 'abc-def', name: 'ARD', number: 1 }]);

      const ch = store.getChannelByUuidOrNumber('abc-def');
      expect(ch).toBeDefined();
      expect(ch!.name).toBe('ARD');
    });

    it('should look up channel by number', () => {
      store.replaceAllChannels([{ uuid: 'abc-def', name: 'ARD', number: 1 }]);

      const ch = store.getChannelByUuidOrNumber('1');
      expect(ch).toBeDefined();
      expect(ch!.uuid).toBe('abc-def');
    });

    it('should return undefined for unknown channel', () => {
      expect(store.getChannelByUuidOrNumber('nonexistent')).toBeUndefined();
    });

    it('should replace all channels atomically', () => {
      store.replaceAllChannels([{ uuid: 'ch-1', name: 'ARD', number: 1 }]);
      expect(store.getChannelCount()).toBe(1);

      store.replaceAllChannels([
        { uuid: 'ch-2', name: 'ZDF', number: 2 },
        { uuid: 'ch-3', name: 'RTL', number: 3 },
      ]);
      expect(store.getChannelCount()).toBe(2);
      expect(store.getChannelByUuidOrNumber('ch-1')).toBeUndefined();
    });
  });

  describe('indexing projection', () => {
    it('should return lightweight events for indexing', () => {
      store.replaceAllEvents([
        makeEvent({
          eventId: 1,
          title: 'Tagesschau',
          subtitle: 'News',
          summary: 'Daily news',
          description: 'Full desc',
        }),
      ]);

      const indexable = store.getAllEventsForIndexing();
      expect(indexable).toHaveLength(1);
      expect(indexable[0]).toEqual({
        eventId: 1,
        title: 'Tagesschau',
        subtitle: 'News',
        summary: 'Daily news',
        description: 'Full desc',
      });
    });
  });

  describe('sync meta', () => {
    it('should return default sync meta', () => {
      const meta = store.getSyncMeta();
      expect(meta.status).toBe('idle');
      expect(meta.eventCount).toBe(0);
      expect(meta.lastRefreshEnd).toBe(0);
    });

    it('should update sync status to refreshing with timestamp', () => {
      store.updateSyncStatus('refreshing');
      const meta = store.getSyncMeta();
      expect(meta.status).toBe('refreshing');
      expect(meta.lastRefreshStart).toBeGreaterThan(0);
    });

    it('should update sync completion', () => {
      store.updateSyncStatus('refreshing');
      store.updateSyncComplete(500, 10);

      const meta = store.getSyncMeta();
      expect(meta.status).toBe('idle');
      expect(meta.eventCount).toBe(500);
      expect(meta.channelCount).toBe(10);
      expect(meta.lastRefreshEnd).toBeGreaterThan(0);
      expect(meta.lastRefreshDuration).toBeGreaterThanOrEqual(0);
    });

    it('should update sync status to error', () => {
      store.updateSyncStatus('error');
      expect(store.getSyncMeta().status).toBe('error');
    });
  });
});
