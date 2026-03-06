import { env } from '$env/dynamic/public';
import { HLS_PROXY_PROFILE_NAME } from './live-profile-options';

export interface LiveStreamUrlPayload {
  channelInput: string;
  channel: {
    uuid: string;
    name: string;
    number?: number;
  };
  profile: string | null;
  url: string;
}

export interface LiveStreamResolveOptions {
  channel: string;
  profile?: string;
}

export type LiveStreamUrlResolver = (opts: LiveStreamResolveOptions) => Promise<LiveStreamUrlPayload>;

export const defaultLiveStreamUrlResolver: LiveStreamUrlResolver = async ({ channel, profile }) => {
  const normalizedChannel = channel.trim();
  if (profile === HLS_PROXY_PROFILE_NAME) {
    return resolveHlsStreamPayload(normalizedChannel);
  }

  const params = new URLSearchParams();
  if (profile) params.set('profile', profile);

  const qs = params.toString();
  const response = await fetch(`/api/channel/${encodeURIComponent(normalizedChannel)}/url${qs ? `?${qs}` : ''}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Failed to resolve stream URL (${response.status})`);
  }

  return (await response.json()) as LiveStreamUrlPayload;
};

async function resolveHlsStreamPayload(channelInput: string): Promise<LiveStreamUrlPayload> {
  const channelResponse = await fetch(`/api/channel/${encodeURIComponent(channelInput)}`);
  if (!channelResponse.ok) {
    const body = (await channelResponse.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Failed to resolve channel (${channelResponse.status})`);
  }

  const channel = (await channelResponse.json()) as {
    uuid: string;
    name: string;
    number?: number;
  };

  return {
    channelInput,
    channel: {
      uuid: channel.uuid,
      name: channel.name,
      ...(typeof channel.number === 'number' ? { number: channel.number } : {}),
    },
    profile: HLS_PROXY_PROFILE_NAME,
    url: buildHlsProxyUrl(channelInput),
  };
}

function buildHlsProxyUrl(channelInput: string): string {
  const path = `/hlsstream/${encodeURIComponent(channelInput)}/index.m3u8`;
  const configuredBaseUrl: unknown = env.PUBLIC_HLS_PROXY_BASE_URL;
  const base = typeof configuredBaseUrl === 'string' ? normalizePublicBaseUrl(configuredBaseUrl) : '';
  if (!base) return path;
  return `${base.replace(/\/$/, '')}${path}`;
}

function normalizePublicBaseUrl(rawValue: string): string {
  const value = rawValue.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return value;
  return `http://${value}`;
}
