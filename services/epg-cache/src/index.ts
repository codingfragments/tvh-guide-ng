import { serve } from '@hono/node-server';
import { loadConfig } from './config.js';
import { EpgStore } from './store.js';
import { SearchIndex } from './search.js';
import { RefreshScheduler } from './scheduler.js';
import { createClient } from './loader.js';
import { createApp } from './server.js';

function main(): void {
  const config = loadConfig();

  const store = new EpgStore(config.sqlitePath);
  const searchIndex = new SearchIndex();
  const client = createClient(config);
  const scheduler = new RefreshScheduler(client, store, searchIndex, config.refreshInterval);
  const app = createApp(store, searchIndex, scheduler, config.refreshInterval);

  const server = serve(
    {
      fetch: app.fetch,
      port: config.httpPort,
    },
    (info) => {
      console.log(`EPG Cache service listening on http://localhost:${String(info.port)}`);
    },
  );

  scheduler.start();

  const shutdown = () => {
    console.log('Shutting down...');
    scheduler.stop();
    server.close();
    store.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main();
