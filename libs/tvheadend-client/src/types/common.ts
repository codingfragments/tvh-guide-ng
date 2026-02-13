/**
 * Common types used across TVHeadend API
 */

/** UUID string format */
export type UUID = string;

/** Unix timestamp in seconds */
export type Timestamp = number;

/** Unix timestamp in milliseconds */
export type TimestampMillis = number;

/** Boolean represented as integer (0 = false, 1 = true) */
export type BooleanInteger = 0 | 1;

/** ISO 639-2/B three-letter language code */
export type Language = string;

/** Channel number for display ordering */
export type ChannelNumber = number;

/** Priority level (0 = important, 6 = unimportant) */
export type Priority = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** File path string */
export type FilePath = string;

/** File size in bytes */
export type FileSize = number;

/** Duration in seconds */
export type Duration = number;

/** Recording status */
export type RecordingStatus =
  | 'scheduled'
  | 'recording'
  | 'completed'
  | 'completedOK'
  | 'completedError'
  | 'completedWarning'
  | 'completedRerecord'
  | 'missed'
  | 'invalid'
  | 'running'
  | 'upcoming';

/** Log severity level */
export type LogSeverity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'ALERT';

/** Connection type */
export type ConnectionType = 'HTTP' | 'HTSP' | 'SAT>IP';

/** Service type */
export type ServiceType = 'DVB-S' | 'DVB-T' | 'DVB-C' | 'IPTV' | 'Other';
