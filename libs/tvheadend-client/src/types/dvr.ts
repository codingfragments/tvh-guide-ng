/**
 * DVR (Digital Video Recorder) types
 */

import type { UUID, Timestamp, Duration, Priority, FilePath, FileSize, RecordingStatus } from './common.js';
import type { GridResponse, GridParams } from './grid.js';

/** DVR recording entry */
export interface DvrEntry {
  /** DVR entry UUID */
  uuid: UUID;
  /** Whether entry is enabled */
  enabled?: boolean;
  /** Channel UUID */
  channel: UUID;
  /** Channel display name */
  channelname: string;
  /** Recording start time */
  start: Timestamp;
  /** Recording stop time */
  stop: Timestamp;
  /** Actual recording start time */
  start_real?: Timestamp;
  /** Actual recording stop time */
  stop_real?: Timestamp;
  /** Extra time before (minutes) */
  start_extra?: number;
  /** Extra time after (minutes) */
  stop_extra?: number;
  /** Scheduled duration */
  duration?: Duration;
  /** Recording title */
  title: string;
  /** Display title (may include subtitle) */
  disp_title?: string;
  /** Episode subtitle */
  subtitle?: string;
  /** Short description */
  summary?: string;
  /** Full description */
  description?: string;
  /** Recording priority */
  pri?: Priority;
  /** Retention days (0 = forever) */
  retention?: number;
  /** Removal days after watched */
  removal?: number;
  /** Playback position (seconds) */
  playposition?: number;
  /** Number of times played */
  playcount?: number;
  /** Recording status */
  status: RecordingStatus;
  /** Scheduler status */
  sched_status?: string;
  /** Number of recording errors */
  errors?: number;
  /** Number of data errors */
  data_errors?: number;
  /** Recording file path */
  filename?: FilePath;
  /** Recording file size */
  filesize?: FileSize;
  /** Playback URL */
  url?: string;
  /** User comment/note */
  comment?: string;
  /** User who created the recording */
  creator?: string;
  /** Error code if failed */
  errorcode?: number;
  /** Associated EPG event ID */
  eventId?: number;
  /** Auto-rec rule UUID if scheduled by rule */
  autorec?: UUID;
  /** Time-based rec rule UUID if applicable */
  timerec?: UUID;
  /** Duplicate detection result */
  duplicate?: number;
}

/** Auto-recording rule */
export interface DvrAutorecEntry {
  /** Rule UUID */
  uuid: UUID;
  /** Whether rule is enabled */
  enabled: boolean;
  /** Rule name */
  name: string;
  /** Optional description */
  comment?: string;
  /** Filter by channel UUID */
  channel?: UUID;
  /** Channel name for display */
  channelname?: string;
  /** Filter by title (supports regex) */
  title?: string;
  /** Filter by subtitle (supports regex) */
  subtitle?: string;
  /** Filter by description (supports regex) */
  description?: string;
  /** Search all text fields */
  fulltext?: boolean;
  /** Filter by genre codes */
  genre?: number[];
  /** Filter by content type */
  contentType?: number;
  /** Minimum duration (seconds) */
  minduration?: number;
  /** Maximum duration (seconds) */
  maxduration?: number;
  /** Start time window */
  start?: Timestamp;
  /** Stop time window */
  stop?: Timestamp;
  /** Start window offset (minutes) */
  start_window?: number;
  /** Extra time before (minutes) */
  start_extra?: number;
  /** Extra time after (minutes) */
  stop_extra?: number;
  /** Recording priority */
  pri?: Priority;
  /** Retention days */
  retention?: number;
  /** Removal days after watched */
  removal?: number;
  /** Day of week filter (1=Monday, 7=Sunday) */
  weekdays?: number[];
  /** Record count (0 = all) */
  record?: number;
  /** Custom recording directory */
  directory?: string;
  /** Owner username */
  owner?: string;
  /** Creator username */
  creator?: string;
}

/** Time-based recording rule */
export interface DvrTimerecEntry {
  /** Rule UUID */
  uuid: UUID;
  /** Whether rule is enabled */
  enabled: boolean;
  /** Rule name */
  name: string;
  /** Optional description */
  comment?: string;
  /** Channel UUID */
  channel: UUID;
  /** Channel name */
  channelname?: string;
  /** Recording title template */
  title?: string;
  /** Start time (minutes since midnight) */
  start: number;
  /** Stop time (minutes since midnight) */
  stop: number;
  /** Days to record */
  weekdays: number[];
  /** Recording priority */
  pri?: Priority;
  /** Retention days */
  retention?: number;
  /** Owner username */
  owner?: string;
  /** Creator username */
  creator?: string;
}

/** DVR configuration profile */
export interface DvrConfig {
  /** Profile UUID */
  uuid: UUID;
  /** Whether profile is enabled */
  enabled: boolean;
  /** Profile name */
  name: string;
  /** Default retention (days) */
  retention_days?: number;
  /** Removal after watched (days) */
  removal_days?: number;
  /** Default pre-padding (minutes) */
  pre_extra_time?: number;
  /** Default post-padding (minutes) */
  post_extra_time?: number;
  /** Recording storage path */
  storage?: string;
  /** Directory permissions (octal) */
  directory_permissions?: string;
  /** File permissions (octal) */
  file_permissions?: string;
  /** Character encoding */
  charset?: string;
  /** Write metadata tags to files */
  tag_files?: boolean;
  /** EPG update window (hours) */
  epg_update_window?: number;
}

/** DVR grid response */
export type DvrGridResponse = GridResponse<DvrEntry>;

/** Auto-rec grid response */
export type DvrAutorecGridResponse = GridResponse<DvrAutorecEntry>;

/** Time-rec grid response */
export type DvrTimerecGridResponse = GridResponse<DvrTimerecEntry>;

/** DVR config grid response */
export type DvrConfigGridResponse = GridResponse<DvrConfig>;

/** DVR grid query parameters */
export interface DvrGridParams extends GridParams {
  /** Filter by recording status */
  status?: RecordingStatus;
}

/** DVR entry creation configuration */
export interface DvrEntryConfig {
  /** Channel UUID */
  channel: UUID;
  /** Recording start time */
  start: Timestamp;
  /** Recording stop time */
  stop: Timestamp;
  /** Recording title */
  title: string;
  /** Episode subtitle */
  subtitle?: string;
  /** Description */
  description?: string;
  /** Priority */
  pri?: Priority;
  /** Extra time before (minutes) */
  start_extra?: number;
  /** Extra time after (minutes) */
  stop_extra?: number;
}

/** DVR entry creation by event */
export interface DvrEntryByEventParams {
  /** EPG event ID to record */
  event_id: number;
  /** Optional DVR config UUID */
  config_uuid?: UUID;
  /** Recording priority */
  pri?: Priority;
  /** Optional DVR config name */
  config_name?: string;
}

/** Auto-rec creation configuration */
export interface DvrAutorecConfig {
  /** Rule name */
  name: string;
  /** Title filter (regex supported) */
  title?: string;
  /** Channel UUID */
  channel?: UUID;
  /** Search all text fields */
  fulltext?: boolean;
  /** Content type filter */
  contentType?: number;
  /** Minimum duration */
  minduration?: number;
  /** Extra time before (minutes) */
  start_extra?: number;
  /** Extra time after (minutes) */
  stop_extra?: number;
}

/** DVR config metadata */
export interface DvrConfigMetadata {
  caption: string;
  properties: Array<{
    id: string;
    caption: string;
    type: string;
    default?: unknown;
    required?: boolean;
  }>;
}

/** DVR entry metadata */
export interface DvrEntryMetadata {
  caption: string;
  properties: Array<{
    id: string;
    caption: string;
    type: string;
    readonly?: boolean;
  }>;
}

/** DVR entry creation parameters (alias for consistency) */
export type DvrEntryCreateParams = DvrEntryConfig;

/** DVR entry class (alias for API consistency) */
export type DvrEntryClass = DvrEntryMetadata;

/** DVR config class (alias for API consistency) */
export type DvrConfigClass = DvrConfigMetadata;

/** Auto-rec creation parameters (alias for consistency) */
export type DvrAutorecCreateParams = DvrAutorecConfig;

/** Auto-rec grid query parameters */
export type DvrAutorecGridParams = GridParams;

/** Time-rec grid query parameters */
export type DvrTimerecGridParams = GridParams;

/** DVR config grid query parameters */
export type DvrConfigGridParams = GridParams;

/** DVR entry cancel parameters */
export interface DvrCancelParams {
  /** Entry UUID to cancel */
  uuid: UUID;
}

/** DVR entry stop parameters */
export interface DvrStopParams {
  /** Entry UUID to stop */
  uuid: UUID;
}

/** DVR entry remove parameters */
export interface DvrRemoveParams {
  /** Entry UUID to remove */
  uuid: UUID;
}

/** DVR file moved notification parameters */
export interface DvrFileMovedParams {
  /** Entry UUID */
  uuid: UUID;
  /** New file path */
  filename: FilePath;
}

/** DVR move to finished parameters */
export interface DvrMoveFinishedParams {
  /** Entry UUID */
  uuid: UUID;
}

/** DVR move to failed parameters */
export interface DvrMoveFailedParams {
  /** Entry UUID */
  uuid: UUID;
}
