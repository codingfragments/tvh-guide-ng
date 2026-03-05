export interface NowEventItem {
  eventId: number;
  channelUuid: string;
  channelName: string;
  channelNumber: number | null;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  start: number;
  stop: number;
  progressPct: number;
  piconUrl: string;
  image?: string;
  episodeNumber?: number;
  seasonNumber?: number;
}

export interface NowEventCredit {
  name: string;
  role: string;
}

export interface NowEventDetail {
  eventId: number;
  description?: string;
  image?: string;
  episodeNumber?: number;
  seasonNumber?: number;
  episodeInfo?: string;
  seriesLink?: string;
  ageRating?: number;
  starRating?: number;
  cast: NowEventCredit[];
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
