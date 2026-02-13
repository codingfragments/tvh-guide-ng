/**
 * Configuration loading and merging utilities
 */

import { cosmiconfigSync } from 'cosmiconfig';
import type { TVHConfig, CLIOptions } from '../types/config.js';

/**
 * Load configuration from file using cosmiconfig
 * Searches for .tvhrc, tvh.config.js, or package.json with "tvh" field
 */
export function loadConfig(): TVHConfig | null {
  try {
    const explorer = cosmiconfigSync('tvh');
    const result = explorer.search();
    return result?.config || null;
  } catch (error) {
    // If config file has syntax errors, return null
    return null;
  }
}

/**
 * Get the path to the configuration file
 */
export function getConfigPath(): string | null {
  try {
    const explorer = cosmiconfigSync('tvh');
    const result = explorer.search();
    return result?.filepath || null;
  } catch (error) {
    return null;
  }
}

/**
 * Merge configuration from file and CLI options
 * CLI options take precedence over config file
 */
export function mergeConfig(
  configFile: TVHConfig | null,
  cliOptions: CLIOptions
): TVHConfig {
  const format = cliOptions.json
    ? 'json'
    : cliOptions.format || configFile?.defaults?.format || 'table';

  const color =
    cliOptions.color !== undefined
      ? cliOptions.color
      : configFile?.defaults?.color !== undefined
        ? configFile.defaults.color
        : true;

  return {
    server: {
      url: cliOptions.url || configFile?.server?.url || '',
      username: cliOptions.username || configFile?.server?.username,
      password: cliOptions.password || configFile?.server?.password,
    },
    defaults: {
      format,
      limit: configFile?.defaults?.limit || 50,
      color,
    },
  };
}
