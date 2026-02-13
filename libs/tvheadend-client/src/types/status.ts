/**
 * Status and monitoring types
 */

import type { UUID, Timestamp, ConnectionType, ServiceType, LogSeverity } from './common.js';
import type { GridResponse } from './grid.js';

/** Server status and health information */
export interface ServerStatus {
  /** Server name */
  name: string;
  /** TVHeadend version */
  version: string;
  /** Software version */
  sw_version: string;
  /** API version number */
  api_version: number;
  /** Server capabilities */
  capabilities: string[];
  /** Current server time */
  time: Timestamp;
  /** GMT offset (minutes) */
  gmtoffset: number;
  /** Server uptime (seconds) */
  uptime: number;
  /** Free disk space (bytes) */
  freediskspace: number;
  /** Total disk space (bytes) */
  totaldiskspace: number;
}

/** Active connection/subscription */
export interface ConnectionStatus {
  /** Connection ID */
  id: number;
  /** Connection type */
  type: ConnectionType;
  /** Client IP address */
  peer: string;
  /** Username */
  user: string;
  /** Connection start time */
  started: Timestamp;
  /** Current channel (if streaming) */
  channel?: string;
  /** Service name */
  service?: string;
  /** Bytes received */
  input: number;
  /** Bytes sent */
  output: number;
}

/** Active streaming subscription */
export interface SubscriptionStatus {
  /** Subscription ID */
  id: number;
  /** Channel name being watched */
  channel: string;
  /** Service name */
  service: string;
  /** Stream profile used */
  profile: string;
  /** Client username */
  username: string;
  /** Subscription start time */
  start: Timestamp;
  /** Subscription weight/priority */
  weight: number;
  /** Input source */
  input?: string;
  /** Client hostname */
  hostname?: string;
  /** Current program title */
  title?: string;
}

/** Server activity status for power management */
export interface ActivityStatus {
  /** Type of activity */
  activity: 'idle' | 'recording' | 'streaming' | 'epggrab';
  /** Activity description */
  description: string;
  /** Can system enter low-power mode */
  canSleep: boolean;
  /** Detailed activity information */
  details?: Array<{
    type: string;
    description: string;
  }>;
}

/** Input/adapter status */
export interface InputStatus {
  /** Adapter UUID */
  uuid: UUID;
  /** Adapter type */
  type: string;
  /** Adapter name */
  name: string;
  /** Currently active */
  active: boolean;
  /** Signal strength */
  signal: number;
  /** Signal-to-noise ratio */
  snr: number;
  /** Bit error rate */
  ber: number;
  /** Uncorrected blocks */
  unc: number;
  /** Active subscriber count */
  subscribers: number;
}

/** Individual service status */
export interface ServiceStatus {
  /** Service UUID */
  uuid: UUID;
  /** Whether service is enabled */
  enabled: boolean;
  /** Service type */
  type: ServiceType;
  /** Network name */
  network: string;
  /** Multiplex name */
  mux: string;
  /** Service name */
  svcname: string;
  /** Linked channel UUID */
  channel?: UUID;
  /** Signal quality percentage */
  quality: number;
  /** Service weight/priority */
  weight?: number;
}

/** System log entry */
export interface SystemLog {
  /** Log timestamp */
  time: Timestamp;
  /** Log severity */
  severity: LogSeverity;
  /** Component that logged */
  subsystem: string;
  /** Log message */
  message: string;
}

/** Service grid response */
export type ServiceGridResponse = GridResponse<ServiceStatus>;

/** Log query parameters */
export interface LogQueryParams {
  /** Starting offset */
  start?: number;
  /** Maximum entries */
  limit?: number;
  /** Minimum log level */
  level?: LogSeverity;
}

/** Log response */
export interface LogResponse {
  entries: SystemLog[];
  total: number;
}

/** Connection cancellation parameters */
export interface ConnectionCancelParams {
  /** Connection ID to disconnect */
  id: number;
}

/** Input stats clear parameters */
export interface InputStatsClearParams {
  /** Optional input UUID to reset (empty = reset all) */
  uuid?: UUID;
}

/** Connections list response */
export interface ConnectionsResponse {
  entries: ConnectionStatus[];
}

/** Subscriptions list response */
export interface SubscriptionsResponse {
  entries: SubscriptionStatus[];
}

/** Activity status response */
export interface ActivityStatusResponse {
  entries: ActivityStatus[];
}

/** Inputs list response */
export interface InputsResponse {
  entries: InputStatus[];
}
