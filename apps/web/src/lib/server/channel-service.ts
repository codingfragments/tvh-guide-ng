import { env } from '$env/dynamic/private';
import { TVHeadendClient, type Channel } from '@tvh-guide/tvheadend-client';

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
  transport?: string | null;
}

export interface ResolvedChannelStream {
  channel: Channel;
  streamPath: string;
  profile: string | null;
  transport: string | null;
}

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

  const transport = resolveTransport(options.transport);
  const profile = resolveProfile(options.profile, transport);

  return {
    channel,
    streamPath: buildTvhStreamPath(channel.uuid, profile, transport),
    profile,
    transport,
  };
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

function resolveProfile(profile: string | null | undefined, transport: string | null | undefined): string | null {
  if (profile && profile.trim()) return profile.trim();
  if (!transport) return null;

  const raw = env.TVH_STREAM_PROFILE_MAP;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed[transport.toLowerCase()] ?? null;
  } catch {
    throw new ChannelServiceConfigError('TVH_STREAM_PROFILE_MAP must be valid JSON (e.g. {"hls":"webtv-hls"})');
  }
}

function resolveTransport(transport: string | null | undefined): string | null {
  if (transport && transport.trim()) return transport.trim();
  if (env.TVH_STREAM_DEFAULT_TRANSPORT && env.TVH_STREAM_DEFAULT_TRANSPORT.trim()) {
    return env.TVH_STREAM_DEFAULT_TRANSPORT.trim();
  }
  return null;
}

function buildTvhStreamPath(channelUuid: string, profile: string | null, transport: string | null): string {
  const template = (env.TVH_STREAM_PATH_TEMPLATE || DEFAULT_STREAM_PATH_TEMPLATE).trim();
  const path = template.replaceAll('{channelUuid}', encodeURIComponent(channelUuid));
  const url = new URL(path, 'http://tvh.local');

  if (profile) url.searchParams.set('profile', profile);
  if (transport) url.searchParams.set('transport', transport);

  return `${url.pathname}${url.search}`;
}
