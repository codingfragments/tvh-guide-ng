import { env as publicEnv } from '$env/dynamic/public';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { parseLimit, parseTimestampOrNow, toNowEventItems, type EpgCacheEvent } from '$lib/server/now';
import type { NowResponse } from '$lib/components/now/types';

interface EpgCacheTimerangeResponse {
  data: EpgCacheEvent[];
  meta?: {
    refreshStatus?: 'idle' | 'refreshing' | 'error';
    cacheAge?: number;
  };
}

export const GET: RequestHandler = async ({ url, fetch }) => {
  let timestamp: number;
  let limit: number;

  try {
    timestamp = parseTimestampOrNow(url.searchParams.get('ts')).timestamp;
    limit = parseLimit(url.searchParams.get('limit'));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid query parameter';
    return json({ error: message }, { status: 400 });
  }

  const epgBaseUrl = (publicEnv.PUBLIC_EPG_CACHE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const upstreamUrl = `${epgBaseUrl}/api/events/timerange?start=${String(timestamp)}&stop=${String(timestamp)}&limit=${String(limit)}`;

  const upstream = await fetch(upstreamUrl);
  if (!upstream.ok) {
    return json(
      {
        error: `EPG cache request failed with status ${String(upstream.status)}`,
      },
      { status: 502 },
    );
  }

  const payload = (await upstream.json()) as EpgCacheTimerangeResponse;
  const items = toNowEventItems(payload.data, timestamp);

  const response: NowResponse = {
    timestamp,
    items,
    meta: {
      total: items.length,
      source: 'epg-cache',
      refreshStatus: payload.meta?.refreshStatus ?? 'unknown',
      cacheAge: payload.meta?.cacheAge ?? -1,
    },
  };

  return json(response);
};
