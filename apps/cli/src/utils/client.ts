/**
 * TVHeadend client factory
 */

import { TVHeadendClient } from '@tvh-guide/tvheadend-client';
import { loadConfig, mergeConfig } from './config.js';
import type { CLIOptions } from '../types/config.js';

/**
 * Create a TVHeadend client instance from CLI options
 * Merges config file settings with CLI flags (CLI flags take precedence)
 */
export function createClient(cliOptions: CLIOptions): TVHeadendClient {
  const configFile = loadConfig();
  const config = mergeConfig(configFile, cliOptions);

  if (!config.server.url) {
    throw new Error(
      'Server URL is required. Use --url flag or create a .tvhrc configuration file.'
    );
  }

  return new TVHeadendClient({
    baseUrl: config.server.url,
    username: config.server.username || '',
    password: config.server.password || '',
  });
}

/**
 * Get the merged configuration for display purposes
 */
export function getConfig(cliOptions: CLIOptions) {
  const configFile = loadConfig();
  return mergeConfig(configFile, cliOptions);
}
