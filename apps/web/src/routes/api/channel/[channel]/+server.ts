import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
  ChannelServiceConfigError,
  createTvheadendClient,
  resolveChannel,
} from '$lib/server/channel-service';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const client = createTvheadendClient();
    const channel = await resolveChannel(client, params.channel);

    if (!channel) {
      return json({ error: `Channel "${params.channel}" not found` }, { status: 404 });
    }

    return json(channel);
  } catch (error) {
    if (error instanceof ChannelServiceConfigError) {
      return json({ error: error.message }, { status: 500 });
    }
    return json({ error: 'Failed to query channel from TVHeadend' }, { status: 500 });
  }
};
