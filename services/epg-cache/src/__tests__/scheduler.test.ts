import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RefreshScheduler } from '../scheduler.js';
import { EpgStore } from '../store.js';
import { SearchIndex } from '../search.js';
import type { TVHeadendClient, EpgGridResponse, ChannelGridResponse } from '@tvh-guide/tvheadend-client';

function createMockClient(eventCount = 2, channelCount = 1): TVHeadendClient {
  const events = Array.from({ length: eventCount }, (_, i) => ({
    eventId: i + 1,
    channelUuid: 'ch-1',
    channelName: 'Test',
    start: 1700000000 + i * 3600,
    stop: 1700003600 + i * 3600,
    title: `Event ${i + 1}`,
  }));

  const channels = Array.from({ length: channelCount }, (_, i) => ({
    uuid: `ch-${i + 1}`,
    enabled: true,
    name: `Channel ${i + 1}`,
    number: i + 1,
  }));

  return {
    getEpgEventsGrid: vi.fn().mockResolvedValue({
      entries: events, total: eventCount, start: 0, limit: 500,
    } satisfies EpgGridResponse),
    getChannelGrid: vi.fn().mockResolvedValue({
      entries: channels, total: channelCount, start: 0, limit: 500,
    } satisfies ChannelGridResponse),
  } as unknown as TVHeadendClient;
}

describe('RefreshScheduler', () => {
  let store: EpgStore;
  let searchIndex: SearchIndex;

  beforeEach(() => {
    store = new EpgStore(':memory:');
    searchIndex = new SearchIndex();
  });

  afterEach(() => {
    store.close();
  });

  it('should refresh and populate store and index', async () => {
    const client = createMockClient(3, 2);
    const scheduler = new RefreshScheduler(client, store, searchIndex, 3600);

    await scheduler.refresh();

    expect(store.getEventCount()).toBe(3);
    expect(store.getChannelCount()).toBe(2);
    expect(searchIndex.getDocumentCount()).toBe(3);

    const meta = store.getSyncMeta();
    expect(meta.status).toBe('idle');
    expect(meta.eventCount).toBe(3);
    expect(meta.channelCount).toBe(2);
  });

  it('should guard against re-entrant refresh', async () => {
    const client = createMockClient();
    const scheduler = new RefreshScheduler(client, store, searchIndex, 3600);

    const p1 = scheduler.refresh();
    const p2 = scheduler.refresh();
    await Promise.all([p1, p2]);

    expect(client.getEpgEventsGrid).toHaveBeenCalledTimes(1);
  });

  it('should report refreshing state', async () => {
    let resolveEvents!: (value: unknown) => void;
    const delayedPromise = new Promise((res) => { resolveEvents = res; });

    const client = {
      getEpgEventsGrid: vi.fn().mockReturnValue(delayedPromise),
      getChannelGrid: vi.fn().mockResolvedValue({
        entries: [], total: 0, start: 0, limit: 500,
      }),
    } as unknown as TVHeadendClient;

    const scheduler = new RefreshScheduler(client, store, searchIndex, 3600);
    const refreshPromise = scheduler.refresh();

    expect(scheduler.isRefreshing()).toBe(true);

    resolveEvents({ entries: [], total: 0, start: 0, limit: 500 });
    await refreshPromise;

    expect(scheduler.isRefreshing()).toBe(false);
  });

  it('should handle refresh errors gracefully', async () => {
    const client = {
      getEpgEventsGrid: vi.fn().mockRejectedValue(new Error('Network error')),
      getChannelGrid: vi.fn().mockRejectedValue(new Error('Network error')),
    } as unknown as TVHeadendClient;

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const scheduler = new RefreshScheduler(client, store, searchIndex, 3600);

    await scheduler.refresh();

    expect(store.getSyncMeta().status).toBe('idle');
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('should provide next refresh time', async () => {
    const client = createMockClient();
    const scheduler = new RefreshScheduler(client, store, searchIndex, 3600);

    expect(scheduler.getNextRefreshTime()).toBeNull();

    // Manually refresh instead of start() to avoid fire-and-forget timing issues
    await scheduler.refresh();

    // Simulate what start() does for the interval tracking
    scheduler.start();
    // Immediately stop to prevent the fire-and-forget refresh from running
    // after store.close() in afterEach — but nextRefreshTime was already set
    const next = scheduler.getNextRefreshTime();
    scheduler.stop();

    expect(next).toBeInstanceOf(Date);
    expect(next!.getTime()).toBeGreaterThan(Date.now() - 1000);

    expect(scheduler.getNextRefreshTime()).toBeNull();

    // Wait for any pending microtasks from start()'s fire-and-forget refresh
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  it('should stop interval on stop()', async () => {
    const client = createMockClient();
    const scheduler = new RefreshScheduler(client, store, searchIndex, 3600);

    // start() fires a fire-and-forget refresh
    scheduler.start();
    // Wait for the initial fire-and-forget refresh to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    scheduler.stop();
    const callCount = (client.getEpgEventsGrid as ReturnType<typeof vi.fn>).mock.calls.length;

    // Wait to ensure no more refreshes fire after stop
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect((client.getEpgEventsGrid as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callCount);
  });
});
