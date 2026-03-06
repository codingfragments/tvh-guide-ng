import { env } from '$env/dynamic/private';
import { TVHeadendClient, type Channel, type StreamProfile as TvhStreamProfile } from '@tvh-guide/tvheadend-client';

const DEFAULT_STREAM_PATH_TEMPLATE = '/stream/channel/{channelUuid}';

export class ChannelServiceConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChannelServiceConfigError';
  }
}

export class ChannelServiceResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChannelServiceResolutionError';
  }
}

export interface ChannelStreamOptions {
  profile?: string | null;
}

export interface ResolvedChannelStream {
  channel: Channel;
  streamPath: string;
  profile: string | null;
}

export type StreamProfile = TvhStreamProfile;

export function createTvheadendClient(): TVHeadendClient {
  const baseUrl = env.TVH_URL;
  const username = env.TVH_USERNAME;
  const password = env.TVH_PASSWORD;

  if (!baseUrl) throw new ChannelServiceConfigError('Missing required env var TVH_URL');
  if (!username) throw new ChannelServiceConfigError('Missing required env var TVH_USERNAME');
  if (!password) throw new ChannelServiceConfigError('Missing required env var TVH_PASSWORD');

  return new TVHeadendClient({
    baseUrl,
    username,
    password,
  });
}

export function getTvheadendBaseUrl(): string {
  if (!env.TVH_URL) throw new ChannelServiceConfigError('Missing required env var TVH_URL');
  return env.TVH_URL.replace(/\/$/, '');
}

export function createTvheadendAuthHeader(): string {
  if (!env.TVH_USERNAME || !env.TVH_PASSWORD) {
    throw new ChannelServiceConfigError('Missing required TVHeadend credentials (TVH_USERNAME/TVH_PASSWORD)');
  }
  return `Basic ${Buffer.from(`${env.TVH_USERNAME}:${env.TVH_PASSWORD}`).toString('base64')}`;
}

export async function resolveChannel(client: TVHeadendClient, inputRaw: string): Promise<Channel | null> {
  const input = inputRaw.trim();
  if (!input) return null;

  if (/^\d+$/.test(input)) {
    const requestedNumber = Number(input);

    const byNumber = await queryChannelByNumberIntsplit(client, requestedNumber);
    if (byNumber && byNumber.number === requestedNumber) return byNumber;

    const byNumberScan = await queryChannelByNumberScan(client, requestedNumber);
    if (byNumberScan) return byNumberScan;

    return querySingle(client, {
      field: 'name',
      type: 'string',
      value: input,
      comparison: 'eq',
    });
  }

  const byUuid = await querySingle(client, {
    field: 'uuid',
    type: 'string',
    value: input,
    comparison: 'eq',
  });
  if (byUuid) return byUuid;

  return querySingle(client, {
    field: 'name',
    type: 'string',
    value: input,
    comparison: 'eq',
  });
}

export async function resolveChannelStream(
  client: TVHeadendClient,
  channelInput: string,
  options: ChannelStreamOptions,
): Promise<ResolvedChannelStream> {
  const channel = await resolveChannel(client, channelInput);
  if (!channel) {
    throw new ChannelServiceResolutionError(`Channel "${channelInput}" not found`);
  }

  const profile = await resolveProfile(options.profile);

  return {
    channel,
    streamPath: buildTvhStreamPath(channel.uuid, profile),
    profile,
  };
}

export async function listStreamProfiles(): Promise<StreamProfile[]> {
  const client = createTvheadendClient();
  return client.listStreamProfiles();
}

async function querySingle(
  client: TVHeadendClient,
  filter: {
    field: 'uuid' | 'number' | 'name';
    type: 'string' | 'numeric';
    value: string | number;
    comparison?: 'eq';
  },
): Promise<Channel | null> {
  const response = await client.getChannelGrid({
    start: 0,
    limit: 1,
    filter: {
      field: filter.field,
      type: filter.type,
      value: filter.value,
      comparison: filter.comparison,
    },
  });

  return response.entries[0] ?? null;
}

async function queryChannelByNumberIntsplit(client: TVHeadendClient, channelNumber: number): Promise<Channel | null> {
  const INTSPLIT = 1_000_000;
  const response = await client.getChannelGrid({
    start: 0,
    limit: 1,
    filter: JSON.stringify({
      field: 'number',
      type: 'numeric',
      comparison: 'eq',
      value: channelNumber * INTSPLIT,
      intsplit: INTSPLIT,
    }),
  });

  return response.entries[0] ?? null;
}

async function queryChannelByNumberScan(client: TVHeadendClient, channelNumber: number): Promise<Channel | null> {
  const PAGE_SIZE = 200;
  let start = 0;
  let total = 0;

  do {
    const response = await client.getChannelGrid({
      start,
      limit: PAGE_SIZE,
      sort: 'number',
      dir: 'ASC',
    });
    total = response.total;

    const match = response.entries.find((channel) => channel.number === channelNumber);
    if (match) return match;

    start += PAGE_SIZE;
  } while (start < total);

  return null;
}

async function resolveProfile(profile: string | null | undefined): Promise<string | null> {
  if (profile && profile.trim()) {
    const requested = profile.trim();
    const normalized = await normalizeProfileToName(requested);
    return normalized;
  }
  if (env.TVH_STREAM_DEFAULT_PROFILE && env.TVH_STREAM_DEFAULT_PROFILE.trim()) {
    return env.TVH_STREAM_DEFAULT_PROFILE.trim();
  }
  return null;
}

function buildTvhStreamPath(channelUuid: string, profile: string | null): string {
  const template = (env.TVH_STREAM_PATH_TEMPLATE || DEFAULT_STREAM_PATH_TEMPLATE).trim();
  const path = template.replaceAll('{channelUuid}', encodeURIComponent(channelUuid));
  const url = new URL(path, 'http://tvh.local');

  if (profile) url.searchParams.set('profile', profile);

  return `${url.pathname}${url.search}`;
}

async function normalizeProfileToName(profile: string): Promise<string> {
  try {
    const profiles = await listStreamProfiles();
    const byName = profiles.find((p) => p.name === profile);
    if (byName) return byName.name;

    const byUuid = profiles.find((p) => p.uuid === profile);
    if (byUuid) return byUuid.name;
  } catch {
    // Keep user-provided value if profile list lookup is unavailable.
  }

  return profile;
}
