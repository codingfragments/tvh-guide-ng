import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type pino from 'pino';
import type { HlsProxyConfig } from './types.js';

const DEFAULT_STREAM_PATH_TEMPLATE = '/stream/channel/{channelUuid}';

export function loadConfig(): HlsProxyConfig {
  loadEnvFile();

  const tvhUrl = required('TVH_URL');
  const tvhUsername = required('TVH_USERNAME');
  const tvhPassword = required('TVH_PASSWORD');
  const tvhProfile = required('HLS_TVH_PROFILE');

  return {
    tvheadend: {
      baseUrl: tvhUrl.replace(/\/$/, ''),
      username: tvhUsername,
      password: tvhPassword,
      streamPathTemplate: optional('HLS_TVH_STREAM_PATH_TEMPLATE', DEFAULT_STREAM_PATH_TEMPLATE),
      profile: tvhProfile,
    },
    httpPort: parseNumber('HLS_HTTP_PORT', 3010, { min: 1, max: 65535 }),
    inactivityGraceMs: parseNumber('HLS_INACTIVITY_GRACE_SECONDS', 90, { min: 5, max: 86400 }) * 1000,
    sweepIntervalMs: parseNumber('HLS_SWEEP_INTERVAL_SECONDS', 10, { min: 2, max: 3600 }) * 1000,
    segmentSeconds: parseNumber('HLS_SEGMENT_SECONDS', 4, { min: 1, max: 30 }),
    playlistSize: parseNumber('HLS_PLAYLIST_SIZE', 8, { min: 2, max: 30 }),
    deleteThreshold: parseNumber('HLS_DELETE_THRESHOLD', 2, { min: 1, max: 20 }),
    startupTimeoutMs: parseNumber('HLS_STARTUP_TIMEOUT_MS', 15000, { min: 2000, max: 120000 }),
    assetWaitTimeoutMs: parseNumber('HLS_ASSET_WAIT_TIMEOUT_MS', 6000, { min: 1000, max: 120000 }),
    ffmpegBin: optional('HLS_FFMPEG_BIN', 'ffmpeg'),
    outputRoot: optional('HLS_OUTPUT_ROOT', './data/hls-proxy'),
    logLevel: parseLogLevel(optional('HLS_LOG_LEVEL', 'info')),
    maxConcurrentTranscodings: parseNumber('HLS_MAX_CONCURRENT_TRANSCODINGS', 6, { min: 1, max: 100 }),
  };
}

function loadEnvFile(): void {
  const envPath = resolve(process.cwd(), '.env');
  if (existsSync(envPath)) {
    process.loadEnvFile(envPath);
  }
}

function required(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) {
    throw new Error(`${key} environment variable is required`);
  }
  return value;
}

function optional(key: string, fallback: string): string {
  const value = process.env[key]?.trim();
  return value && value.length > 0 ? value : fallback;
}

function parseNumber(
  key: string,
  fallback: number,
  limits: { min: number; max: number },
): number {
  const raw = process.env[key]?.trim();
  if (!raw) return fallback;

  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${key} must be a valid integer`);
  }
  if (parsed < limits.min || parsed > limits.max) {
    throw new Error(`${key} must be between ${String(limits.min)} and ${String(limits.max)}`);
  }
  return parsed;
}

function parseLogLevel(value: string): pino.LevelWithSilent {
  const normalized = value.toLowerCase();
  const allowed: pino.LevelWithSilent[] = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];
  if (allowed.includes(normalized as pino.LevelWithSilent)) {
    return normalized as pino.LevelWithSilent;
  }
  throw new Error(`HLS_LOG_LEVEL must be one of: ${allowed.join(', ')}`);
}
