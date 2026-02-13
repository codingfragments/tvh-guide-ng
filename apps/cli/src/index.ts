/**
 * TVHeadend CLI - Programmatic API
 *
 * This file exports utilities and types for programmatic use of the CLI
 */

// Export configuration utilities
export { loadConfig, getConfigPath, mergeConfig } from './utils/config.js';

// Export client factory
export { createClient, getConfig } from './utils/client.js';

// Export output formatting utilities
export {
  formatTable,
  formatJSON,
  formatOutput,
  formatBoolean,
  formatDateTime,
  truncate,
  type ColumnDefinition,
} from './utils/output.js';

// Export error handling utilities
export { handleError, warn, success, info } from './utils/errors.js';

// Export prompt utilities
export { prompt, promptPassword, confirm } from './utils/prompts.js';

// Export configuration types
export type {
  ServerConfig,
  DefaultsConfig,
  TVHConfig,
  CLIOptions,
} from './types/config.js';
