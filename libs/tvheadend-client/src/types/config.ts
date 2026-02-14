/**
 * Configuration management types
 */

/** Configuration node in hierarchical configuration system */
export interface ConfigNode {
  /** Node identifier */
  uuid: string;
  /** Node type */
  type?: string;
  /** Display name */
  name?: string;
  /** Child nodes */
  children?: ConfigNode[];
  /** Configuration parameters */
  params?: ConfigParam[];
}

/** Configuration parameter definition */
export interface ConfigParam {
  /** Parameter ID */
  id: string;
  /** Display label */
  caption: string;
  /** Data type */
  type: 'str' | 'int' | 'bool' | 'list' | 'enum';
  /** Current value */
  value?: unknown;
  /** Default value */
  default?: unknown;
  /** Is read-only */
  readonly?: boolean;
  /** Is advanced option */
  advanced?: boolean;
  /** Is required */
  required?: boolean;
  /** Allowed values (for enum type) */
  enum?: Array<{
    key: string;
    val: string;
  }>;
  /** Help text */
  description?: string;
}

/** Server information */
export interface ServerInfo {
  /** Server name */
  name: string;
  /** TVHeadend version */
  version: string;
  /** Software version */
  sw_version: string;
  /** API version number */
  api_version: number;
  /** Server capabilities */
  capabilities?: string[];
}

/** Server compile-time capabilities */
export interface ServerCapabilities {
  /** List of capability identifiers */
  entries: string[];
}

/** Server configuration */
export interface ServerConfig {
  /** Server name */
  server_name?: string;
  /** UI language */
  language?: string;
  /** Server timezone */
  timezone?: string;
  /** HTTP port */
  http_port?: number;
  /** HTSP port */
  htsp_port?: number;
}

/** Configuration save parameters */
export interface ConfigSaveParams {
  /** Configuration node */
  node: string;
  /** Configuration data */
  conf: Record<string, unknown>;
}

/** Configuration load parameters */
export interface ConfigLoadParams {
  /** Node identifier */
  node?: string;
}
