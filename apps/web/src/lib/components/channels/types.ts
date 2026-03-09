import type { NowEventItem } from '$lib/components/now/types';

export interface ChannelListEntry {
  uuid: string;
  name: string;
  number: number | null;
  piconUrl: string;
}

export interface ChannelsResponse {
  items: ChannelListEntry[];
  meta: {
    total: number;
    source: 'epg-cache';
  };
}

export interface ChannelEventsResponse {
  fromTs: number;
  current: NowEventItem | null;
  upcoming: NowEventItem[];
  meta: {
    requestedLimit: number | null;
    effectiveLimit: number;
    source: 'epg-cache';
  };
}
