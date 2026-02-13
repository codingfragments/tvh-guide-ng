/**
 * Configuration types for the TVHeadend CLI
 */

export interface ServerConfig {
  url: string;
  username?: string;
  password?: string;
}

export interface DefaultsConfig {
  format?: 'table' | 'json';
  limit?: number;
  color?: boolean;
}

export interface TVHConfig {
  server: ServerConfig;
  defaults?: DefaultsConfig;
}

export interface CLIOptions {
  url?: string;
  username?: string;
  password?: string;
  json?: boolean;
  format?: 'table' | 'json';
  quiet?: boolean;
  verbose?: boolean;
  color?: boolean;
}
