import type { NowEventItem } from '$lib/components/now/types';

export interface EpgCacheEvent {
  eventId: number;
  channelUuid: string;
  channelName: string;
  channelNumber?: number;
  start: number;
  stop: number;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  image?: string;
  episodeNumber?: number;
  seasonNumber?: number;
}

export function parseTimestampOrNow(raw: string | null, nowTs: number = Math.floor(Date.now() / 1000)): {
  timestamp: number;
  isNowMode: boolean;
} {
  if (!raw) {
    return { timestamp: nowTs, isNowMode: true };
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Invalid ts parameter. Expected unix timestamp in seconds.');
  }

  return { timestamp: parsed, isNowMode: false };
}

export function parseLimit(raw: string | null, defaultLimit: number = 200): number {
  if (!raw) return defaultLimit;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Invalid limit parameter. Expected positive integer.');
  }
  return Math.min(parsed, 1000);
}

export function toNowEventItems(events: EpgCacheEvent[], timestamp: number): NowEventItem[] {
  return events
    .map((event) => ({
      eventId: event.eventId,
      channelUuid: event.channelUuid,
      channelName: event.channelName,
      channelNumber: event.channelNumber ?? null,
      title: event.title,
      subtitle: event.subtitle,
      summary: event.summary,
      description: event.description,
      start: event.start,
      stop: event.stop,
      progressPct: calculateProgressPct(event.start, event.stop, timestamp),
      piconUrl: `picon://channel/${event.channelName}`,
      image: event.image,
      episodeNumber: event.episodeNumber,
      seasonNumber: event.seasonNumber,
    }))
    .sort((a, b) => {
      const numberA = a.channelNumber ?? Number.MAX_SAFE_INTEGER;
      const numberB = b.channelNumber ?? Number.MAX_SAFE_INTEGER;
      if (numberA !== numberB) return numberA - numberB;
      return a.channelName.localeCompare(b.channelName);
    });
}

export function calculateProgressPct(start: number, stop: number, ts: number): number {
  const duration = stop - start;
  if (duration <= 0) return 0;
  const raw = ((ts - start) / duration) * 100;
  return clamp(raw, 0, 100);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
