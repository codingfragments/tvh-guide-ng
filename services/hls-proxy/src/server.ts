import { randomUUID } from 'node:crypto';
import { Hono, type Context } from 'hono';
import { cors } from 'hono/cors';
import type pino from 'pino';
import { ChannelResolutionError } from './channel-resolver.js';
import {
  AssetResolutionError,
  HlsSessionManager,
  SessionStartupError,
  TranscodingLimitError,
} from './session-manager.js';
import type { HlsProxyConfig, SessionAccessContext } from './types.js';

type AppEnv = {
  Variables: {
    requestId: string;
  };
};

export function createApp(manager: HlsSessionManager, logger: pino.Logger, config: HlsProxyConfig): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  app.use(
    '/hlsstream/*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'HEAD', 'OPTIONS'],
      allowHeaders: ['Range', 'Content-Type', 'Accept', 'Origin'],
      exposeHeaders: ['Content-Length', 'Content-Range', 'Accept-Ranges', 'Content-Type'],
      maxAge: 86400,
    }),
  );

  app.use('*', async (c, next) => {
    const requestId = randomUUID();
    c.set('requestId', requestId);
    const start = Date.now();

    try {
      await next();
    } catch (error) {
      logger.error(
        {
          event: 'request_error',
          requestId,
          method: c.req.method,
          path: c.req.path,
          error: error instanceof Error ? error.message : String(error),
        },
        'Unhandled request error',
      );

      throw error;
    } finally {
      const durationMs = Date.now() - start;
      c.header('x-request-id', requestId);

      logger.info(
        {
          event: 'http_request',
          requestId,
          method: c.req.method,
          path: c.req.path,
          status: c.res.status,
          durationMs,
          remoteAddress: getRemoteAddress(c.req.raw.headers),
          userAgent: c.req.header('user-agent') ?? null,
        },
        'HTTP request',
      );
    }
  });

  app.get('/api/health', (c) => {
    const snapshots = manager.getSnapshots();

    return c.json({
      status: 'ok',
      activeTranscodings: snapshots.length,
      service: {
        port: config.httpPort,
        outputRoot: config.outputRoot,
        ffmpegBin: config.ffmpegBin,
        inactivityGraceMs: config.inactivityGraceMs,
        sweepIntervalMs: config.sweepIntervalMs,
        maxConcurrentTranscodings: config.maxConcurrentTranscodings,
      },
      now: new Date().toISOString(),
    });
  });

  app.get('/api/transcodings', (c) => {
    const snapshots = manager.getSnapshots();

    return c.json({
      count: snapshots.length,
      transcodings: snapshots,
    });
  });

  app.get('/hlsstream/:channel', async (c) => {
    const channelInput = c.req.param('channel');
    const context = toSessionContext(c, c.req.path);

    try {
      await manager.warmupChannel(channelInput, context);

      return c.redirect(`/hlsstream/${encodeURIComponent(channelInput)}/index.m3u8`, 307);
    } catch (error) {
      return mapErrorToResponse(c, error, logger, context);
    }
  });

  app.get('/hlsstream/:channel/index.m3u8', async (c) => {
    const channelInput = c.req.param('channel');
    const context = toSessionContext(c, c.req.path);

    try {
      const body = await manager.readPlaylist(channelInput, context);
      c.header('Content-Type', 'application/vnd.apple.mpegurl');
      c.header('Cache-Control', 'no-store');
      c.header('Cross-Origin-Resource-Policy', 'cross-origin');
      return c.body(body);
    } catch (error) {
      return mapErrorToResponse(c, error, logger, context);
    }
  });

  app.get('/hlsstream/:channel/:asset', async (c) => {
    const channelInput = c.req.param('channel');
    const asset = c.req.param('asset');
    const context = toSessionContext(c, c.req.path);

    try {
      const { body, contentType } = await manager.readAsset(channelInput, asset, context);
      c.header('Content-Type', contentType);
      c.header('Cache-Control', 'no-store');
      c.header('Cross-Origin-Resource-Policy', 'cross-origin');
      return c.body(body);
    } catch (error) {
      return mapErrorToResponse(c, error, logger, context);
    }
  });

  return app;
}

function toSessionContext(c: Context<AppEnv>, path: string): SessionAccessContext {
  return {
    requestId: c.get('requestId'),
    remoteAddress: getRemoteAddress(c.req.raw.headers),
    userAgent: c.req.header('user-agent') ?? null,
    path,
  };
}

function getRemoteAddress(headers: Headers): string | null {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return null;
}

function mapErrorToResponse(
  c: Context<AppEnv>,
  error: unknown,
  logger: pino.Logger,
  context: SessionAccessContext,
) {
  const message = error instanceof Error ? error.message : String(error);

  if (error instanceof ChannelResolutionError) {
    const status = /not found/i.test(message) ? 404 : 400;
    return c.json({ error: message }, status);
  }

  if (error instanceof AssetResolutionError) {
    const status = /timed out/i.test(message) ? 504 : 400;
    return c.json({ error: message }, status);
  }

  if (error instanceof SessionStartupError) {
    return c.json({ error: message }, 502);
  }

  if (error instanceof TranscodingLimitError) {
    return c.json({ error: message }, 429);
  }

  logger.error(
    {
      event: 'route_error',
      requestId: context.requestId,
      path: context.path,
      message,
    },
    'Unhandled route error',
  );
  return c.json({ error: 'Internal server error' }, 500);
}
