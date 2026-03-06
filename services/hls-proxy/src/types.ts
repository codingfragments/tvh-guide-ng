import type pino from 'pino';
import type { ChildProcessWithoutNullStreams } from 'node:child_process';
import type { Channel } from '@tvh-guide/tvheadend-client';

export interface HlsProxyConfig {
  tvheadend: {
    baseUrl: string;
    username: string;
    password: string;
    streamPathTemplate: string;
    profile: string;
  };
  httpPort: number;
  inactivityGraceMs: number;
  sweepIntervalMs: number;
  segmentSeconds: number;
  playlistSize: number;
  deleteThreshold: number;
  startupTimeoutMs: number;
  assetWaitTimeoutMs: number;
  ffmpegBin: string;
  outputRoot: string;
  logLevel: pino.LevelWithSilent;
  maxConcurrentTranscodings: number;
}

export interface ResolvedChannelStream {
  channel: Channel;
  channelInput: string;
  streamPath: string;
  streamUrl: string;
}

export type TranscodingSessionState = 'starting' | 'ready' | 'stopping' | 'failed';

export interface SessionAccessContext {
  requestId?: string;
  remoteAddress?: string | null;
  userAgent?: string | null;
  path?: string;
}

export interface TranscodingSession {
  id: string;
  channelInput: string;
  channelUuid: string;
  channelName: string;
  outputDir: string;
  playlistPath: string;
  segmentPattern: string;
  upstreamUrl: string;
  state: TranscodingSessionState;
  startedAt: number;
  readyAt: number | null;
  lastTouchAt: number;
  requestCount: number;
  ffmpegProcess: ChildProcessWithoutNullStreams;
  readyPromise: Promise<void>;
  stopPromise: Promise<void> | null;
  exitPromise: Promise<{ code: number | null; signal: NodeJS.Signals | null }>;
  finalized: boolean;
  finalizationPromise: Promise<void> | null;
}

export interface TranscodingSnapshot {
  id: string;
  channelInput: string;
  channelUuid: string;
  channelName: string;
  state: TranscodingSessionState;
  startedAt: string;
  readyAt: string | null;
  lastTouchAt: string;
  ageSeconds: number;
  idleSeconds: number;
  requestCount: number;
}
