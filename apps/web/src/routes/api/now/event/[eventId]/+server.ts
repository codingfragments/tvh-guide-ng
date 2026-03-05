import { env as publicEnv } from '$env/dynamic/public';
import type { NowEventCredit, NowEventDetail } from '$lib/components/now/types';
import type { EpgCacheEvent } from '$lib/server/now';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface EpgCacheEventDetail extends EpgCacheEvent {
  episodeInfo?: string;
  episodeUri?: string;
  seriesLink?: string;
  ageRating?: number;
  starRating?: number;
  credits?: Array<{
    name?: string;
    role?: string;
  }>;
}

interface EpgCacheEventResponse {
  data: EpgCacheEventDetail;
}

export const GET: RequestHandler = async ({ params, fetch }) => {
  const eventId = parseEventId(params.eventId);
  if (!eventId) {
    return json({ error: 'Invalid event ID. Expected positive integer.' }, { status: 400 });
  }

  const epgBaseUrl = (publicEnv.PUBLIC_EPG_CACHE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const upstream = await fetch(`${epgBaseUrl}/api/events/${String(eventId)}`);
  if (!upstream.ok) {
    if (upstream.status === 404) {
      return json({ error: 'Event not found' }, { status: 404 });
    }
    return json({ error: `EPG cache request failed with status ${String(upstream.status)}` }, { status: 502 });
  }

  const payload = (await upstream.json()) as EpgCacheEventResponse;
  const cacheEvent = payload.data;

  const detail: NowEventDetail = {
    eventId,
    description: cacheEvent.description,
    image: cacheEvent.image,
    episodeNumber: cacheEvent.episodeNumber,
    seasonNumber: cacheEvent.seasonNumber,
    episodeInfo: cacheEvent.episodeInfo,
    seriesLink: cacheEvent.seriesLink,
    ageRating: cacheEvent.ageRating,
    starRating: cacheEvent.starRating,
    cast: normalizeCredits(cacheEvent.credits),
  };

  return json(detail);
};

function parseEventId(raw: string): number | null {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function normalizeCredits(
  credits:
    | Array<{
        name?: string;
        role?: string;
      }>
    | undefined,
): NowEventCredit[] {
  if (!credits || credits.length === 0) return [];

  return credits
    .filter((credit): credit is { name: string; role: string } => Boolean(credit.name && credit.role))
    .map((credit) => ({
      name: credit.name.trim(),
      role: credit.role.trim(),
    }))
    .filter((credit) => credit.name.length > 0 && credit.role.length > 0)
    .sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
}
