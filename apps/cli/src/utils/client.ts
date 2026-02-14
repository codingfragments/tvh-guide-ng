/**
 * TVHeadend client factory
 */

import { TVHeadendClient } from '@tvh-guide/tvheadend-client';
import { loadConfig, mergeConfig } from './config.js';
import type { CLIOptions } from '../types/config.js';
import type { TVHConfig } from '../types/config.js';

/**
 * Create a TVHeadend client and merged config from CLI options.
 * Loads the config file once and returns both the client and the resolved config.
 */
export function createClientAndConfig(cliOptions: CLIOptions): { client: TVHeadendClient; config: TVHConfig } {
  const configFile = loadConfig();
  const config = mergeConfig(configFile, cliOptions);

  if (!config.server.url) {
    throw new Error('Server URL is required. Use --url flag or create a .tvhrc configuration file.');
  }

  const client = new TVHeadendClient({
    baseUrl: config.server.url,
    username: config.server.username || '',
    password: config.server.password || '',
  });

  return { client, config };
}

/**
 * Create a TVHeadend client instance from CLI options.
 * Use this for commands that don't need the resolved config.
 */
export function createClient(cliOptions: CLIOptions): TVHeadendClient {
  return createClientAndConfig(cliOptions).client;
}

/**
 * Get the merged configuration for display purposes
 */
export function getConfig(cliOptions: CLIOptions) {
  const configFile = loadConfig();
  return mergeConfig(configFile, cliOptions);
}
