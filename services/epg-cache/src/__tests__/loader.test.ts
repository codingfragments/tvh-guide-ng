import { describe, it, expect, vi } from 'vitest';
import { fetchAllEvents, fetchAllChannels } from '../loader.js';
import type {
  TVHeadendClient,
  EpgEvent,
  Channel,
  EpgGridResponse,
  ChannelGridResponse,
} from '@tvh-guide/tvheadend-client';

function makeEvent(id: number): EpgEvent {
  return {
    eventId: id,
    channelUuid: 'ch-1',
    channelName: 'Test',
    start: 1700000000 + id,
    stop: 1700003600 + id,
    title: `Event ${id}`,
  };
}

function makeChannel(i: number): Channel {
  return {
    uuid: `ch-${i}`,
    enabled: true,
    name: `Channel ${i}`,
    number: i,
  };
}

describe('fetchAllEvents', () => {
  it('should fetch all events in a single page', async () => {
    const events = [makeEvent(1), makeEvent(2), makeEvent(3)];
    const client = {
      getEpgEventsGrid: vi.fn().mockResolvedValue({
        entries: events,
        total: 3,
        start: 0,
        limit: 500,
      } satisfies EpgGridResponse),
    } as unknown as TVHeadendClient;

    const result = await fetchAllEvents(client);
    expect(result).toHaveLength(3);
    expect(client.getEpgEventsGrid).toHaveBeenCalledTimes(1);
  });

  it('should paginate across multiple pages', async () => {
    const page1 = Array.from({ length: 500 }, (_, i) => makeEvent(i));
    const page2 = Array.from({ length: 200 }, (_, i) => makeEvent(500 + i));

    const client = {
      getEpgEventsGrid: vi
        .fn()
        .mockResolvedValueOnce({ entries: page1, total: 700, start: 0, limit: 500 } satisfies EpgGridResponse)
        .mockResolvedValueOnce({ entries: page2, total: 700, start: 500, limit: 500 } satisfies EpgGridResponse),
    } as unknown as TVHeadendClient;

    const result = await fetchAllEvents(client);
    expect(result).toHaveLength(700);
    expect(client.getEpgEventsGrid).toHaveBeenCalledTimes(2);
    expect(client.getEpgEventsGrid).toHaveBeenCalledWith({
      start: 0,
      limit: 500,
      sort: 'start',
      dir: 'ASC',
    });
    expect(client.getEpgEventsGrid).toHaveBeenCalledWith({
      start: 500,
      limit: 500,
      sort: 'start',
      dir: 'ASC',
    });
  });

  it('should handle empty response', async () => {
    const client = {
      getEpgEventsGrid: vi.fn().mockResolvedValue({
        entries: [],
        total: 0,
        start: 0,
        limit: 500,
      } satisfies EpgGridResponse),
    } as unknown as TVHeadendClient;

    const result = await fetchAllEvents(client);
    expect(result).toHaveLength(0);
  });
});

describe('fetchAllChannels', () => {
  it('should fetch all channels in a single page', async () => {
    const channels = [makeChannel(1), makeChannel(2)];
    const client = {
      getChannelGrid: vi.fn().mockResolvedValue({
        entries: channels,
        total: 2,
        start: 0,
        limit: 500,
      } satisfies ChannelGridResponse),
    } as unknown as TVHeadendClient;

    const result = await fetchAllChannels(client);
    expect(result).toHaveLength(2);
    expect(client.getChannelGrid).toHaveBeenCalledTimes(1);
  });

  it('should paginate channels across multiple pages', async () => {
    const page1 = Array.from({ length: 500 }, (_, i) => makeChannel(i));
    const page2 = Array.from({ length: 50 }, (_, i) => makeChannel(500 + i));

    const client = {
      getChannelGrid: vi
        .fn()
        .mockResolvedValueOnce({ entries: page1, total: 550, start: 0, limit: 500 } satisfies ChannelGridResponse)
        .mockResolvedValueOnce({ entries: page2, total: 550, start: 500, limit: 500 } satisfies ChannelGridResponse),
    } as unknown as TVHeadendClient;

    const result = await fetchAllChannels(client);
    expect(result).toHaveLength(550);
    expect(client.getChannelGrid).toHaveBeenCalledTimes(2);
  });
});
