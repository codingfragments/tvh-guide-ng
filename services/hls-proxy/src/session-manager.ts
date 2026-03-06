import { spawn } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';
import { access, mkdir, readFile, rm } from 'node:fs/promises';
import { join, resolve, sep } from 'node:path';
import { createInterface } from 'node:readline';
import { setTimeout as delay } from 'node:timers/promises';
import type pino from 'pino';
import { ChannelResolver } from './channel-resolver.js';
import type {
  HlsProxyConfig,
  ResolvedChannelStream,
  SessionAccessContext,
  TranscodingSession,
  TranscodingSnapshot,
} from './types.js';

const SESSION_STOP_TIMEOUT_MS = 5000;
const FILE_POLL_INTERVAL_MS = 200;
const SAFE_ASSET_PATTERN = /^[A-Za-z0-9._-]+$/;

export class TranscodingLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TranscodingLimitError';
  }
}

export class SessionStartupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SessionStartupError';
  }
}

export class AssetResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssetResolutionError';
  }
}

export class HlsSessionManager {
  private readonly sessions = new Map<string, TranscodingSession>();
  private readonly sessionStarts = new Map<string, Promise<TranscodingSession>>();
  private sweepTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: HlsProxyConfig,
    private readonly resolver: ChannelResolver,
    private readonly logger: pino.Logger,
  ) {}

  async start(): Promise<void> {
    await mkdir(this.config.outputRoot, { recursive: true });
    this.sweepTimer = setInterval(() => {
      void this.reapInactiveSessions();
    }, this.config.sweepIntervalMs);
    this.sweepTimer.unref();

    this.logger.info(
      {
        event: 'session_manager_started',
        outputRoot: this.config.outputRoot,
        inactivityGraceMs: this.config.inactivityGraceMs,
        sweepIntervalMs: this.config.sweepIntervalMs,
      },
      'HLS session manager started',
    );
  }

  async shutdown(): Promise<void> {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = null;
    }

    const activeSessions = [...this.sessions.values()];
    await Promise.all(activeSessions.map((session) => this.stopSession(session, 'service_shutdown')));

    this.logger.info({ event: 'session_manager_stopped' }, 'HLS session manager stopped');
  }

  getSnapshots(): TranscodingSnapshot[] {
    const now = Date.now();
    return [...this.sessions.values()]
      .map((session) => ({
        id: session.id,
        channelInput: session.channelInput,
        channelUuid: session.channelUuid,
        channelName: session.channelName,
        state: session.state,
        startedAt: new Date(session.startedAt).toISOString(),
        readyAt: session.readyAt ? new Date(session.readyAt).toISOString() : null,
        lastTouchAt: new Date(session.lastTouchAt).toISOString(),
        ageSeconds: Math.floor((now - session.startedAt) / 1000),
        idleSeconds: Math.floor((now - session.lastTouchAt) / 1000),
        requestCount: session.requestCount,
      }))
      .sort((a, b) => b.ageSeconds - a.ageSeconds);
  }

  async warmupChannel(channelInput: string, context: SessionAccessContext): Promise<void> {
    await this.ensureSession(channelInput, context);
  }

  async readPlaylist(channelInput: string, context: SessionAccessContext): Promise<Buffer> {
    const session = await this.ensureSession(channelInput, context);
    await waitForExistingFile(session.playlistPath, this.config.assetWaitTimeoutMs);
    this.touchSession(session, context);
    return readFile(session.playlistPath);
  }

  async readAsset(
    channelInput: string,
    asset: string,
    context: SessionAccessContext,
  ): Promise<{ body: Buffer; contentType: string }> {
    if (!asset || !SAFE_ASSET_PATTERN.test(asset)) {
      throw new AssetResolutionError('Invalid HLS asset name');
    }

    const session = await this.ensureSession(channelInput, context);
    const outputDirResolved = resolve(session.outputDir);
    const filePath = resolve(outputDirResolved, asset);

    const expectedPrefix = `${outputDirResolved}${sep}`;
    if (!(filePath === outputDirResolved || filePath.startsWith(expectedPrefix))) {
      throw new AssetResolutionError('Invalid HLS asset path');
    }

    await waitForExistingFile(filePath, this.config.assetWaitTimeoutMs);
    this.touchSession(session, context);

    return {
      body: await readFile(filePath),
      contentType: resolveContentType(asset),
    };
  }

  private async ensureSession(channelInput: string, context: SessionAccessContext): Promise<TranscodingSession> {
    const resolved = await this.resolver.resolveChannelStream(channelInput);
    const channelUuid = resolved.channel.uuid;

    const existing = this.sessions.get(channelUuid);
    if (existing) {
      if (existing.state === 'failed' || existing.state === 'stopping') {
        await this.stopSession(existing, 'replace_unhealthy_session');
      } else {
        await existing.readyPromise;
        this.touchSession(existing, context);
        return existing;
      }
    }

    const inFlight = this.sessionStarts.get(channelUuid);
    if (inFlight) {
      const session = await inFlight;
      this.touchSession(session, context);
      return session;
    }

    if (this.sessions.size >= this.config.maxConcurrentTranscodings) {
      throw new TranscodingLimitError(
        `Reached max concurrent transcodings (${String(this.config.maxConcurrentTranscodings)})`,
      );
    }

    const startPromise = this.startSession(resolved, context);
    this.sessionStarts.set(channelUuid, startPromise);

    try {
      const session = await startPromise;
      this.touchSession(session, context);
      return session;
    } finally {
      this.sessionStarts.delete(channelUuid);
    }
  }

  private async startSession(resolved: ResolvedChannelStream, context: SessionAccessContext): Promise<TranscodingSession> {
    const startedAt = Date.now();
    const sessionId = `${resolved.channel.uuid}-${startedAt.toString(36)}`;
    const outputDir = join(this.config.outputRoot, resolved.channel.uuid);
    const playlistPath = join(outputDir, 'index.m3u8');
    const segmentPattern = join(outputDir, 'segment_%06d.ts');

    await rm(outputDir, { recursive: true, force: true });
    await mkdir(outputDir, { recursive: true });

    const ffmpegArgs = this.buildFfmpegArgs({
      streamUrl: resolved.streamUrl,
      playlistPath,
      segmentPattern,
    });

    const ffmpegProcess = spawn(this.config.ffmpegBin, ffmpegArgs, {
      stdio: ['ignore', 'ignore', 'pipe'],
    });

    let resolveExit: (value: { code: number | null; signal: NodeJS.Signals | null }) => void;
    const exitPromise = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) => {
      resolveExit = resolve;
    });

    const session: TranscodingSession = {
      id: sessionId,
      channelInput: resolved.channelInput,
      channelUuid: resolved.channel.uuid,
      channelName: resolved.channel.name,
      outputDir,
      playlistPath,
      segmentPattern,
      upstreamUrl: resolved.streamUrl,
      state: 'starting',
      startedAt,
      readyAt: null,
      lastTouchAt: startedAt,
      requestCount: 0,
      ffmpegProcess,
      readyPromise: Promise.resolve(),
      stopPromise: null,
      exitPromise,
      finalized: false,
      finalizationPromise: null,
    };

    this.sessions.set(session.channelUuid, session);

    ffmpegProcess.once('error', (error) => {
      resolveExit({ code: null, signal: null });
      session.state = 'failed';

      this.logger.error(
        {
          event: 'ffmpeg_spawn_error',
          sessionId,
          channelUuid: session.channelUuid,
          error: error.message,
          requestId: context.requestId,
        },
        'ffmpeg failed to start',
      );

      void this.finalizeSession(session, 'spawn_error');
    });

    ffmpegProcess.once('exit', (code, signal) => {
      resolveExit({ code, signal });

      const wasStopping = session.state === 'stopping';
      const logPayload = {
        event: 'ffmpeg_exit',
        sessionId,
        channelUuid: session.channelUuid,
        code,
        signal,
      };

      if (wasStopping) {
        this.logger.info(logPayload, 'ffmpeg stopped');
      } else {
        session.state = 'failed';
        this.logger.error(logPayload, 'ffmpeg exited unexpectedly');
      }

      void this.finalizeSession(session, wasStopping ? 'stopped' : 'unexpected_exit');
    });

    this.captureFfmpegLogs(session);

    session.readyPromise = (async () => {
      try {
        await waitForValidPlaylist(playlistPath, this.config.startupTimeoutMs);
        session.state = 'ready';
        session.readyAt = Date.now();

        this.logger.info(
          {
            event: 'transcoding_ready',
            sessionId,
            channelInput: resolved.channelInput,
            channelUuid: session.channelUuid,
            channelName: session.channelName,
            startupMs: session.readyAt - session.startedAt,
            requestId: context.requestId,
          },
          'Transcoding ready',
        );
      } catch (error) {
        session.state = 'failed';
        await this.stopSession(session, 'startup_timeout_or_failure');

        const message = error instanceof Error ? error.message : 'Unknown startup failure';
        throw new SessionStartupError(`Failed to start HLS session for ${resolved.channelInput}: ${message}`);
      }
    })();

    await session.readyPromise;

    this.logger.info(
      {
        event: 'transcoding_started',
        sessionId,
        channelInput: resolved.channelInput,
        channelUuid: session.channelUuid,
        channelName: session.channelName,
        upstreamUrl: resolved.streamUrl,
      },
      'Started ffmpeg transcoding',
    );

    return session;
  }

  private buildFfmpegArgs(args: {
    streamUrl: string;
    playlistPath: string;
    segmentPattern: string;
  }): string[] {
    const authHeader = this.resolver.createAuthHeader();

    return [
      '-nostdin',
      '-hide_banner',
      '-loglevel',
      'warning',
      '-headers',
      `Authorization: ${authHeader}\r\n`,
      '-i',
      args.streamUrl,
      '-map',
      '0:v:0?',
      '-map',
      '0:a:0?',
      '-c:v',
      'copy',
      '-c:a',
      'copy',
      '-f',
      'hls',
      '-hls_time',
      String(this.config.segmentSeconds),
      '-hls_list_size',
      String(this.config.playlistSize),
      '-hls_delete_threshold',
      String(this.config.deleteThreshold),
      '-hls_flags',
      'delete_segments+independent_segments+omit_endlist+temp_file',
      '-hls_segment_type',
      'mpegts',
      '-hls_segment_filename',
      args.segmentPattern,
      args.playlistPath,
    ];
  }

  private captureFfmpegLogs(session: TranscodingSession): void {
    const stream = session.ffmpegProcess.stderr;

    const lineReader = createInterface({ input: stream });
    lineReader.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const payload = {
        event: 'ffmpeg_log',
        sessionId: session.id,
        channelUuid: session.channelUuid,
        line: trimmed,
      };

      if (/error|failed|invalid/i.test(trimmed)) {
        this.logger.warn(payload, 'ffmpeg stderr');
      } else {
        this.logger.debug(payload, 'ffmpeg stderr');
      }
    });
  }

  private touchSession(session: TranscodingSession, context: SessionAccessContext): void {
    session.lastTouchAt = Date.now();
    session.requestCount += 1;

    this.logger.debug(
      {
        event: 'session_touch',
        sessionId: session.id,
        channelUuid: session.channelUuid,
        requestId: context.requestId,
        path: context.path,
        remoteAddress: context.remoteAddress,
      },
      'HLS session touched',
    );
  }

  private async reapInactiveSessions(): Promise<void> {
    const now = Date.now();
    const stale = [...this.sessions.values()].filter((session) => {
      if (session.state === 'stopping') return false;
      return now - session.lastTouchAt > this.config.inactivityGraceMs;
    });

    if (stale.length === 0) return;

    this.logger.info(
      {
        event: 'stale_sessions_detected',
        count: stale.length,
        graceMs: this.config.inactivityGraceMs,
      },
      'Stopping inactive transcodings',
    );

    await Promise.all(stale.map((session) => this.stopSession(session, 'inactive_timeout')));
  }

  private async stopSession(session: TranscodingSession, reason: string): Promise<void> {
    if (session.stopPromise) {
      return session.stopPromise;
    }

    session.state = 'stopping';
    session.stopPromise = (async () => {
      const killPayload = {
        event: 'transcoding_stop',
        sessionId: session.id,
        channelUuid: session.channelUuid,
        reason,
      };

      this.logger.info(killPayload, 'Stopping transcoding session');

      if (!session.ffmpegProcess.killed) {
        session.ffmpegProcess.kill('SIGTERM');
      }

      const exited = await waitForExit(session.exitPromise, SESSION_STOP_TIMEOUT_MS);
      if (!exited) {
        this.logger.warn(
          {
            event: 'transcoding_force_kill',
            sessionId: session.id,
            channelUuid: session.channelUuid,
          },
          'ffmpeg did not stop gracefully, sending SIGKILL',
        );

        if (!session.ffmpegProcess.killed) {
          session.ffmpegProcess.kill('SIGKILL');
        }

        await session.exitPromise;
      }

      await this.finalizeSession(session, reason);
    })();

    return session.stopPromise;
  }

  private async finalizeSession(session: TranscodingSession, reason: string): Promise<void> {
    if (session.finalizationPromise) {
      return session.finalizationPromise;
    }

    session.finalizationPromise = (async () => {
      if (session.finalized) return;
      session.finalized = true;

      this.sessions.delete(session.channelUuid);
      await rm(session.outputDir, { recursive: true, force: true });

      this.logger.info(
        {
          event: 'transcoding_finalized',
          sessionId: session.id,
          channelUuid: session.channelUuid,
          reason,
        },
        'Transcoding session finalized',
      );
    })();

    return session.finalizationPromise;
  }
}

async function waitForExit(
  exitPromise: Promise<{ code: number | null; signal: NodeJS.Signals | null }>,
  timeoutMs: number,
): Promise<boolean> {
  const result = await Promise.race([
    exitPromise.then(() => true),
    delay(timeoutMs).then(() => false),
  ]);
  return result;
}

async function waitForValidPlaylist(playlistPath: string, timeoutMs: number): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const exists = await canReadFile(playlistPath);
    if (exists) {
      const content = await readFile(playlistPath, 'utf8');
      if (content.includes('#EXTM3U')) {
        return;
      }
    }

    await delay(FILE_POLL_INTERVAL_MS);
  }

  throw new Error(`Timed out waiting for playlist ${playlistPath}`);
}

async function waitForExistingFile(path: string, timeoutMs: number): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await canReadFile(path)) return;
    await delay(FILE_POLL_INTERVAL_MS);
  }

  throw new AssetResolutionError(`Timed out waiting for HLS asset ${path}`);
}

async function canReadFile(path: string): Promise<boolean> {
  try {
    await access(path, fsConstants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function resolveContentType(asset: string): string {
  const normalized = asset.toLowerCase();
  if (normalized.endsWith('.m3u8')) return 'application/vnd.apple.mpegurl';
  if (normalized.endsWith('.m4s')) return 'video/iso.segment';
  if (normalized.endsWith('.mp4')) return 'video/mp4';
  return 'video/mp2t';
}
