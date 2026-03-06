import { serve } from '@hono/node-server';
import { loadConfig } from './config.js';
import { createLogger } from './logger.js';
import { ChannelResolver } from './channel-resolver.js';
import { HlsSessionManager } from './session-manager.js';
import { createApp } from './server.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger(config.logLevel).child({ service: 'hls-proxy' });

  const resolver = new ChannelResolver(config, logger);
  const sessionManager = new HlsSessionManager(config, resolver, logger);
  await sessionManager.start();

  const app = createApp(sessionManager, logger, config);

  const server = serve(
    {
      fetch: app.fetch,
      port: config.httpPort,
    },
    (info) => {
      logger.info(
        {
          event: 'service_started',
          port: info.port,
        },
        'HLS proxy service listening',
      );
    },
  );

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    logger.info({ event: 'service_shutdown', signal }, 'Shutting down HLS proxy service');

    server.close();
    await sessionManager.shutdown();

    process.exit(0);
  };

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fatal startup error: ${message}`);
  process.exit(1);
});
