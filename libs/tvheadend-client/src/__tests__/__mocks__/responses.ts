/**
 * Mock API responses for testing
 */

import type {
  EpgEvent,
  EpgEventDetail,
  EpgGridResponse,
  ContentType,
  Channel,
  ChannelGridResponse,
  ChannelTag,
  ChannelTagGridResponse,
  DvrEntry,
  DvrGridResponse,
  DvrAutorecEntry,
  DvrAutorecGridResponse,
  DvrConfig,
  DvrConfigGridResponse,
  ServerInfo,
  ConnectionStatus,
  ConnectionsResponse,
  SubscriptionStatus,
  SubscriptionsResponse,
  InputStatus,
  InputsResponse,
} from '../../types/index.js';

// ========================================
// EPG Mocks
// ========================================

export const mockEpgEvent: EpgEvent = {
  eventId: 123456,
  channelUuid: '550e8400-e29b-41d4-a716-446655440000',
  channelName: 'BBC One HD',
  channelNumber: 101,
  start: 1704067200,
  stop: 1704070800,
  duration: 3600,
  title: 'Test Program',
  subtitle: 'Episode 1',
  summary: 'A test program summary',
  description: 'A detailed description of the test program',
  genre: [16, 32],
  contentType: 16,
  hd: true,
  widescreen: true,
};

export const mockEpgEventDetail: EpgEventDetail = {
  ...mockEpgEvent,
  credits: [
    { name: 'John Doe', role: 'Director' },
    { name: 'Jane Smith', role: 'Actor' },
  ],
  episodeInfo: 'S01E01',
  category: ['Drama'],
};

export const mockEpgGridResponse: EpgGridResponse = {
  entries: [mockEpgEvent],
  total: 1,
  start: 0,
  limit: 50,
};

export const mockContentType: ContentType = {
  code: 16,
  name: 'Movie / Drama',
  icon: 'movie',
};

// ========================================
// Channel Mocks
// ========================================

export const mockChannel: Channel = {
  uuid: '550e8400-e29b-41d4-a716-446655440001',
  enabled: true,
  name: 'BBC One HD',
  number: 101,
  icon: 'https://example.com/bbc-one.png',
  epgauto: true,
  dvr_pre_time: 2,
  dvr_pst_time: 5,
  services: ['service-uuid-1'],
  tags: ['tag-uuid-1'],
};

export const mockChannelGridResponse: ChannelGridResponse = {
  entries: [mockChannel],
  total: 1,
  start: 0,
  limit: 50,
};

export const mockChannelTag: ChannelTag = {
  uuid: 'tag-uuid-1',
  enabled: true,
  name: 'HD Channels',
  comment: 'All HD quality channels',
  index: 1,
};

export const mockChannelTagGridResponse: ChannelTagGridResponse = {
  entries: [mockChannelTag],
  total: 1,
  start: 0,
  limit: 50,
};

// ========================================
// DVR Mocks
// ========================================

export const mockDvrEntry: DvrEntry = {
  uuid: 'dvr-entry-uuid-1',
  enabled: true,
  channel: '550e8400-e29b-41d4-a716-446655440001',
  channelname: 'BBC One HD',
  start: 1704067200,
  stop: 1704070800,
  start_real: 1704067200,
  stop_real: 1704070800,
  duration: 3600,
  title: 'Test Recording',
  subtitle: 'Episode 1',
  summary: 'Test recording summary',
  description: 'Test recording description',
  pri: 2,
  status: 'completed',
  filename: '/recordings/test-recording.ts',
  filesize: 1073741824,
  eventId: 123456,
};

export const mockDvrGridResponse: DvrGridResponse = {
  entries: [mockDvrEntry],
  total: 1,
  start: 0,
  limit: 50,
};

export const mockDvrAutorecEntry: DvrAutorecEntry = {
  uuid: 'autorec-uuid-1',
  enabled: true,
  name: 'Record All News',
  comment: 'Auto-record all news programs',
  title: 'News',
  fulltext: true,
  pri: 2,
  retention: 7,
};

export const mockDvrAutorecGridResponse: DvrAutorecGridResponse = {
  entries: [mockDvrAutorecEntry],
  total: 1,
  start: 0,
  limit: 50,
};

export const mockDvrConfig: DvrConfig = {
  uuid: 'dvr-config-uuid-1',
  enabled: true,
  name: 'Default Profile',
  retention_days: 30,
  removal_days: 7,
  pre_extra_time: 2,
  post_extra_time: 5,
  storage: '/recordings',
  tag_files: true,
};

export const mockDvrConfigGridResponse: DvrConfigGridResponse = {
  entries: [mockDvrConfig],
  total: 1,
  start: 0,
  limit: 50,
};

// ========================================
// Config Mocks
// ========================================

export const mockServerInfo: ServerInfo = {
  name: 'Test TVHeadend Server',
  version: '4.3-2024',
  sw_version: '4.3.2024',
  api_version: 20,
  capabilities: ['timeshift', 'trace', 'imagecache'],
};

// ========================================
// Status Mocks
// ========================================

export const mockConnectionStatus: ConnectionStatus = {
  id: 1,
  type: 'HTTP',
  peer: '192.168.1.100',
  user: 'admin',
  started: 1704067200,
  input: 0,
  output: 1024000,
};

export const mockConnectionsResponse: ConnectionsResponse = {
  entries: [mockConnectionStatus],
};

export const mockSubscriptionStatus: SubscriptionStatus = {
  id: 1,
  channel: 'BBC One HD',
  service: 'BBC One HD Service',
  profile: 'pass',
  username: 'admin',
  start: 1704067200,
  weight: 100,
  title: 'Test Program',
};

export const mockSubscriptionsResponse: SubscriptionsResponse = {
  entries: [mockSubscriptionStatus],
};

export const mockInputStatus: InputStatus = {
  uuid: 'input-uuid-1',
  type: 'DVB-S',
  name: 'Adapter 1',
  active: true,
  signal: 85,
  snr: 90,
  ber: 0,
  unc: 0,
  subscribers: 1,
};

export const mockInputsResponse: InputsResponse = {
  entries: [mockInputStatus],
};
