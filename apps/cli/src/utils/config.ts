/**
 * Configuration loading and merging utilities
 */

import { cosmiconfigSync } from 'cosmiconfig';
import { homedir } from 'os';
import { join } from 'path';
import type { TVHConfig, CLIOptions } from '../types/config.js';

/**
 * Create cosmiconfig explorer with custom search locations
 */
function createExplorer() {
  return cosmiconfigSync('tvh', {
    searchPlaces: [
      'package.json',
      '.tvhrc',
      '.tvhrc.json',
      '.tvhrc.yaml',
      '.tvhrc.yml',
      '.tvhrc.js',
      '.tvhrc.cjs',
      'tvh.config.js',
      'tvh.config.cjs',
    ],
  });
}

/**
 * Load configuration from file using cosmiconfig
 * Searches for .tvhrc, tvh.config.js, or package.json with "tvh" field
 * Checks current directory, parent directories, and home directory
 */
export function loadConfig(): TVHConfig | null {
  try {
    const explorer = createExplorer();

    // First try to search from current directory upward
    let result = explorer.search();

    // If not found, explicitly check home directory
    if (!result) {
      const homeConfigPath = join(homedir(), '.tvhrc');
      result = explorer.load(homeConfigPath);
    }

    return result?.config || null;
  } catch {
    // If config file has syntax errors or doesn't exist, return null
    return null;
  }
}

/**
 * Get the path to the configuration file
 */
export function getConfigPath(): string | null {
  try {
    const explorer = createExplorer();

    // First try to search from current directory upward
    let result = explorer.search();

    // If not found, explicitly check home directory
    if (!result) {
      const homeConfigPath = join(homedir(), '.tvhrc');
      result = explorer.load(homeConfigPath);
    }

    return result?.filepath || null;
  } catch {
    return null;
  }
}

/**
 * Merge configuration from file and CLI options
 * CLI options take precedence over config file
 */
export function mergeConfig(configFile: TVHConfig | null, cliOptions: CLIOptions): TVHConfig {
  const format = cliOptions.json ? 'json' : cliOptions.format || configFile?.defaults?.format || 'table';

  const color =
    cliOptions.color !== undefined
      ? cliOptions.color
      : configFile?.defaults?.color !== undefined
        ? configFile.defaults.color
        : true;

  return {
    server: {
      url: cliOptions.url || configFile?.server.url || '',
      username: cliOptions.username || configFile?.server.username,
      password: cliOptions.password || configFile?.server.password,
    },
    defaults: {
      format,
      limit: configFile?.defaults?.limit || 50,
      color,
    },
  };
}
