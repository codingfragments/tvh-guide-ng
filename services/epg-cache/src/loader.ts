import { TVHeadendClient, type EpgEvent, type Channel } from '@tvh-guide/tvheadend-client';
import type { EpgCacheConfig } from './types.js';

const PAGE_SIZE = 500;

export function createClient(config: EpgCacheConfig): TVHeadendClient {
  return new TVHeadendClient({
    baseUrl: config.tvheadend.url,
    username: config.tvheadend.username,
    password: config.tvheadend.password,
  });
}

export async function fetchAllEvents(client: TVHeadendClient): Promise<EpgEvent[]> {
  const allEvents: EpgEvent[] = [];
  let offset = 0;

  while (true) {
    const response = await client.getEpgEventsGrid({
      start: offset,
      limit: PAGE_SIZE,
      sort: 'start',
      dir: 'ASC',
    });

    allEvents.push(...response.entries);

    if (allEvents.length >= response.total || response.entries.length < PAGE_SIZE) {
      break;
    }
    offset += PAGE_SIZE;
  }

  return allEvents;
}

export async function fetchAllChannels(client: TVHeadendClient): Promise<Channel[]> {
  const allChannels: Channel[] = [];
  let offset = 0;

  while (true) {
    const response = await client.getChannelGrid({
      start: offset,
      limit: PAGE_SIZE,
      sort: 'number',
      dir: 'ASC',
    });

    allChannels.push(...response.entries);

    if (allChannels.length >= response.total || response.entries.length < PAGE_SIZE) {
      break;
    }
    offset += PAGE_SIZE;
  }

  return allChannels;
}
