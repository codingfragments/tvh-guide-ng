import { calculateProgressPct } from '$lib/server/now';
import { createEpgCacheClient, EpgCacheConfigError, parsePositiveInt } from '$lib/server/epg-cache';
import type { ChannelEventsResponse } from '$lib/components/channels/types';
import type { NowEventItem } from '$lib/components/now/types';
import type { RequestHandler } from './$types';
import { EpgCacheError } from '@tvh-guide/epg-cache-client';
import { json } from '@sveltejs/kit';

const DEFAULT_UPCOMING_LIMIT = 5;
const MAX_UPCOMING_LIMIT = 50;
const LOOKAHEAD_SECONDS = 7 * 24 * 60 * 60;

export const GET: RequestHandler = async ({ url }) => {
  const channel = url.searchParams.get('channel')?.trim();
  if (!channel) {
    return json({ error: 'Missing required query parameter "channel"' }, { status: 400 });
  }

  let fromTs: number;
  try {
    fromTs = parseFromTimestamp(url.searchParams.get('from'));
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid "from" query parameter' }, { status: 400 });
  }

  const limitRaw = url.searchParams.get('limit');
  const requestedLimit = parseRequestedLimit(limitRaw);
  if (limitRaw && requestedLimit === null) {
    return json({ error: 'Invalid "limit" query parameter. Expected a positive integer.' }, { status: 400 });
  }

  const effectiveLimit = parsePositiveInt(limitRaw, DEFAULT_UPCOMING_LIMIT, { max: MAX_UPCOMING_LIMIT });

  try {
    const client = createEpgCacheClient();
    const timerange = await client.getEventsByTimerange({
      start: fromTs,
      stop: fromTs + LOOKAHEAD_SECONDS,
      channel,
      limit: effectiveLimit + 1,
    });

    const sortedEvents = [...timerange.data].sort((a, b) => a.start - b.start);
    const nowItems = sortedEvents.map((event) => mapToNowEventItem(event, fromTs));

    const current = nowItems.find((item) => item.start <= fromTs && item.stop > fromTs) ?? null;
    const upcoming = nowItems.filter((item) => item.start > fromTs).slice(0, effectiveLimit);

    const response: ChannelEventsResponse = {
      fromTs,
      current,
      upcoming,
      meta: {
        requestedLimit,
        effectiveLimit,
        source: 'epg-cache',
      },
    };

    return json(response);
  } catch (error) {
    if (error instanceof EpgCacheConfigError) {
      return json({ error: error.message }, { status: 500 });
    }

    if (error instanceof EpgCacheError) {
      return json(
        {
          error: error.message,
        },
        { status: error.statusCode ?? 502 },
      );
    }

    return json({ error: 'Failed to query events from EPG cache service' }, { status: 500 });
  }
};

function parseFromTimestamp(raw: string | null): number {
  if (!raw || raw === 'now') {
    return Math.floor(Date.now() / 1000);
  }

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error('Invalid "from" query parameter. Expected "now" or unix timestamp in seconds.');
  }

  return parsed;
}

function parseRequestedLimit(raw: string | null): number | null {
  if (!raw) return null;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;

  return Math.min(parsed, MAX_UPCOMING_LIMIT);
}

function mapToNowEventItem(
  event: {
    eventId: number;
    channelUuid: string;
    channelName: string;
    channelNumber?: number;
    title: string;
    subtitle?: string;
    summary?: string;
    description?: string;
    start: number;
    stop: number;
    image?: string;
    episodeNumber?: number;
    seasonNumber?: number;
  },
  fromTs: number,
): NowEventItem {
  return {
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
    progressPct: calculateProgressPct(event.start, event.stop, fromTs),
    piconUrl: `picon://channel/${event.channelName}`,
    image: event.image,
    episodeNumber: event.episodeNumber,
    seasonNumber: event.seasonNumber,
  };
}
