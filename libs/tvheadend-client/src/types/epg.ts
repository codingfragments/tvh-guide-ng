/**
 * EPG (Electronic Program Guide) types
 */

import type { UUID, Timestamp, Duration, ChannelNumber } from './common.js';
import type { GridResponse } from './grid.js';

/** EPG event representing a TV program */
export interface EpgEvent {
  /** Unique event ID */
  eventId: number;
  /** UUID of the channel broadcasting this event */
  channelUuid: UUID;
  /** Human-readable channel name */
  channelName: string;
  /** Channel number */
  channelNumber?: ChannelNumber;
  /** Channel icon URL */
  channelIcon?: string;
  /** Event start time */
  start: Timestamp;
  /** Event end time */
  stop: Timestamp;
  /** Event duration in seconds */
  duration?: Duration;
  /** Event title/name */
  title: string;
  /** Episode subtitle or secondary title */
  subtitle?: string;
  /** Short description */
  summary?: string;
  /** Full detailed description */
  description?: string;
  /** Genre/category codes */
  genre?: number[];
  /** Primary content type code */
  contentType?: number;
  /** Series link identifier */
  seriesLink?: string;
  /** Episode number within season */
  episodeNumber?: number;
  /** Season number */
  seasonNumber?: number;
  /** Part number (for multi-part episodes) */
  partNumber?: number;
  /** Total number of parts */
  partCount?: number;
  /** Episode URI for unique identification */
  episodeUri?: string;
  /** Event poster/thumbnail image URL */
  image?: string;
  /** ID of the next event on this channel */
  nextEventId?: number;
  /** Minimum age rating */
  ageRating?: number;
  /** Star rating */
  starRating?: number;
  /** HD flag */
  hd?: boolean;
  /** Widescreen flag */
  widescreen?: boolean;
  /** Audio description available */
  audioDesc?: boolean;
  /** Subtitles available */
  subtitled?: boolean;
}

/** Detailed EPG event with additional metadata */
export interface EpgEventDetail extends EpgEvent {
  /** Cast and crew information */
  credits?: Array<{
    name: string;
    role: string;
  }>;
  /** Episode information */
  episodeInfo?: string;
  /** Copyright information */
  copyright?: string;
  /** Category information */
  category?: string;
}

/** Content type/genre */
export interface ContentType {
  /** Content type code */
  code: number;
  /** Content type name */
  name: string;
  /** Icon identifier */
  icon?: string;
}

/** EPG grid response */
export type EpgGridResponse = GridResponse<EpgEvent>;

/** EPG grid query parameters */
export interface EpgGridParams {
  /** Starting offset */
  start?: number;
  /** Maximum number of items */
  limit?: number;
  /** Sort field */
  sort?: string;
  /** Sort direction */
  dir?: 'ASC' | 'DESC';
  /** Filter expression */
  filter?: string;
  /** Channel filter */
  channel?: UUID | UUID[];
  /** Channel tag filter */
  channelTag?: UUID;
  /** Content type filter */
  contentType?: number;
  /** Minimum duration filter (seconds) */
  durationMin?: number;
  /** Maximum duration filter (seconds) */
  durationMax?: number;
  /** Full-text search */
  fulltext?: string;
  /** Query mode */
  mode?: 'now' | 'upcoming' | 'window';
  /** Language filter */
  language?: string;
}

/** Content type list response */
export interface ContentTypeListResponse {
  entries: ContentType[];
}

/** Brand list item (deprecated) */
export interface BrandListItem {
  key: string;
  val: string;
}

/** Brand list response */
export interface BrandListResponse {
  entries: BrandListItem[];
}

/** EPG brand (alias for consistency) */
export type EpgBrand = BrandListItem;
