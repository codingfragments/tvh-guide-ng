/**
 * Channel management types
 */

import type { UUID, ChannelNumber } from './common.js';
import type { GridResponse } from './grid.js';

/** TV channel entity */
export interface Channel {
  /** Channel UUID */
  uuid: UUID;
  /** Whether channel is enabled */
  enabled: boolean;
  /** Channel display name */
  name: string;
  /** Channel number */
  number?: ChannelNumber;
  /** Channel icon URL */
  icon?: string;
  /** Public URL for channel icon */
  iconPublicUrl?: string;
  /** Automatically update EPG */
  epgauto?: boolean;
  /** EPG source IDs */
  epggrab?: string[];
  /** Recording padding before (minutes) */
  dvr_pre_time?: number;
  /** Recording padding after (minutes) */
  dvr_pst_time?: number;
  /** Linked service UUIDs */
  services?: UUID[];
  /** Channel tag UUIDs */
  tags?: UUID[];
  /** Bouquet name */
  bouquet?: string;
}

/** Channel tag for grouping channels */
export interface ChannelTag {
  /** Tag UUID */
  uuid: UUID;
  /** Whether tag is enabled */
  enabled: boolean;
  /** Tag name */
  name: string;
  /** Optional description */
  comment?: string;
  /** Tag icon URL */
  icon?: string;
  /** Internal/system tag */
  internal?: boolean;
  /** Private/hidden tag */
  private?: boolean;
  /** Display order index */
  index?: number;
}

/** Simplified channel list item */
export interface ChannelListItem {
  /** Channel UUID */
  key: UUID;
  /** Channel display name */
  val: string;
}

/** EPG event category/genre */
export interface ChannelCategory {
  /** Category code */
  key: string;
  /** Category name */
  val: string;
}

/** Channel grid response */
export type ChannelGridResponse = GridResponse<Channel>;

/** Channel tag grid response */
export type ChannelTagGridResponse = GridResponse<ChannelTag>;

/** Channel list response */
export interface ChannelListResponse {
  entries: ChannelListItem[];
}

/** Channel category list response */
export interface ChannelCategoryListResponse {
  entries: ChannelCategory[];
}

/** Channel grid query parameters */
export interface ChannelGridParams {
  start?: number;
  limit?: number;
  sort?: string;
  dir?: 'ASC' | 'DESC';
  filter?: string;
  /** Filter by channel tag UUID(s) */
  tags?: UUID | UUID[];
}

/** Channel creation/update configuration */
export interface ChannelConfig {
  /** Channel name */
  name: string;
  /** Channel number */
  number?: number;
  /** Whether channel is enabled */
  enabled?: boolean;
  /** Service UUIDs to link */
  services?: UUID[];
}

/** Channel tag configuration */
export interface ChannelTagConfig {
  /** Tag name */
  name: string;
  /** Whether tag is enabled */
  enabled?: boolean;
  /** Optional description */
  comment?: string;
  /** Icon URL */
  icon?: string;
  /** Display order */
  index?: number;
}

/** Channel class metadata */
export interface ChannelClassMetadata {
  caption: string;
  properties: Array<{
    id: string;
    caption: string;
    type: string;
    default?: unknown;
    enum?: unknown[];
    required?: boolean;
  }>;
}

/** Channel tag class metadata */
export interface ChannelTagMetadata {
  caption: string;
  properties: Array<{
    id: string;
    caption: string;
    type: string;
    default?: unknown;
    required?: boolean;
  }>;
}

/** Channel tag grid query parameters */
export interface ChannelTagGridParams {
  start?: number;
  limit?: number;
  sort?: string;
  dir?: 'ASC' | 'DESC';
  filter?: string;
}

/** Channel tag list response */
export interface ChannelTagListResponse {
  entries: ChannelTag[];
}

/** Channel class (alias for API consistency) */
export type ChannelClass = ChannelClassMetadata;

/** Channel tag class (alias for API consistency) */
export type ChannelTagClass = ChannelTagMetadata;
