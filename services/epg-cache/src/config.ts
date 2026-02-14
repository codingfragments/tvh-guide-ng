import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { EpgCacheConfig } from './types.js';

function loadEnvFile(): void {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
}

export function loadConfig(): EpgCacheConfig {
  loadEnvFile();

  const url = process.env.TVH_URL;
  if (!url) {
    throw new Error('TVH_URL environment variable is required');
  }

  return {
    tvheadend: {
      url,
      username: process.env.TVH_USERNAME ?? '',
      password: process.env.TVH_PASSWORD ?? '',
    },
    refreshInterval: parseInt(process.env.EPG_REFRESH_INTERVAL ?? '3600', 10),
    httpPort: parseInt(process.env.EPG_HTTP_PORT ?? '3000', 10),
    sqlitePath: process.env.EPG_SQLITE_PATH ?? './data/epg-cache.db',
  };
}
