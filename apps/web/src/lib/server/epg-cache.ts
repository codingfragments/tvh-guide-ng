import { env as publicEnv } from '$env/dynamic/public';
import { EpgCacheClient } from '@tvh-guide/epg-cache-client';

const DEFAULT_EPG_CACHE_URL = 'http://localhost:3000';

export class EpgCacheConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EpgCacheConfigError';
  }
}

export function createEpgCacheClient(): EpgCacheClient {
  const baseUrl = (publicEnv.PUBLIC_EPG_CACHE_URL || DEFAULT_EPG_CACHE_URL).trim();
  if (!baseUrl) {
    throw new EpgCacheConfigError('Missing required env var PUBLIC_EPG_CACHE_URL');
  }

  return new EpgCacheClient({
    baseUrl,
  });
}

export function parsePositiveInt(
  raw: string | null | undefined,
  fallback: number,
  options: { max?: number } = {},
): number {
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;

  if (options.max !== undefined) {
    return Math.min(parsed, options.max);
  }

  return parsed;
}
