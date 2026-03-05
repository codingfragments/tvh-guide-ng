export interface NowEventItem {
  eventId: number;
  channelUuid: string;
  channelName: string;
  channelNumber: number | null;
  title: string;
  subtitle?: string;
  summary?: string;
  start: number;
  stop: number;
  progressPct: number;
  piconUrl: string;
}

export interface NowResponseMeta {
  total: number;
  source: 'epg-cache';
  refreshStatus: 'idle' | 'refreshing' | 'error' | 'unknown';
  cacheAge: number;
}

export interface NowResponse {
  timestamp: number;
  items: NowEventItem[];
  meta: NowResponseMeta;
}
