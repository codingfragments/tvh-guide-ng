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
  const params = new URLSearchParams();
  if (profile) params.set('profile', profile);

  const qs = params.toString();
  const response = await fetch(`/api/channel/${encodeURIComponent(channel)}/url${qs ? `?${qs}` : ''}`);
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Failed to resolve stream URL (${response.status})`);
  }

  return (await response.json()) as LiveStreamUrlPayload;
};
