import {
  ChannelServiceConfigError,
  listStreamProfiles,
} from '$lib/server/channel-service';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

interface ProfileOption {
  name: string;
  label: string;
}

export const GET: RequestHandler = async () => {
  try {
    const profiles = await listStreamProfiles();
    const options: ProfileOption[] = profiles.map((profile) => ({
      name: profile.name,
      label: profile.label,
    }));
    return json({ profiles: options });
  } catch (error) {
    if (error instanceof ChannelServiceConfigError) {
      return json({ error: error.message }, { status: 500 });
    }
    return json({ error: 'Failed to query stream profiles from TVHeadend' }, { status: 500 });
  }
};
