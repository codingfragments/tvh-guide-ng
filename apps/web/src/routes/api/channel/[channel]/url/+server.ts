import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  ChannelServiceConfigError,
  ChannelServiceResolutionError,
  createTvheadendClient,
  resolveChannelStream,
} from '$lib/server/channel-service';

export const GET: RequestHandler = async ({ params, url }) => {
  const profile = url.searchParams.get('profile');

  try {
    const client = createTvheadendClient();
    const resolved = await resolveChannelStream(client, params.channel, { profile });

    return json({
      channelInput: params.channel,
      channel: resolved.channel,
      profile: resolved.profile,
      url: `/api/channel/${encodeURIComponent(params.channel)}/stream${
        resolved.profile
          ? `?${new URLSearchParams({
              ...(resolved.profile ? { profile: resolved.profile } : {}),
            }).toString()}`
          : ''
      }`,
    });
  } catch (error) {
    if (error instanceof ChannelServiceResolutionError) {
      return json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ChannelServiceConfigError) {
      return json({ error: error.message }, { status: 500 });
    }
    return json({ error: 'Failed to resolve channel stream URL' }, { status: 500 });
  }
};
