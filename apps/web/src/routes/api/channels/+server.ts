import { createEpgCacheClient, EpgCacheConfigError } from '$lib/server/epg-cache';
import type { ChannelListEntry, ChannelsResponse } from '$lib/components/channels/types';
import type { RequestHandler } from './$types';
import { EpgCacheError } from '@tvh-guide/epg-cache-client';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
  try {
    const client = createEpgCacheClient();
    const payload = await client.getChannels();

    const items: ChannelListEntry[] = payload.data
      .filter((channel) => channel.enabled)
      .map((channel) => ({
        uuid: channel.uuid,
        name: channel.name,
        number: channel.number ?? null,
        piconUrl: `picon://channel/${channel.name}`,
      }))
      .sort((a, b) => {
        const numberA = a.number ?? Number.MAX_SAFE_INTEGER;
        const numberB = b.number ?? Number.MAX_SAFE_INTEGER;

        if (numberA !== numberB) return numberA - numberB;
        return a.name.localeCompare(b.name);
      });

    const response: ChannelsResponse = {
      items,
      meta: {
        total: items.length,
        source: 'epg-cache',
      },
    };

    return json(response);
  } catch (error) {
    if (error instanceof EpgCacheConfigError) {
      return json({ error: error.message }, { status: 500 });
    }

    if (error instanceof EpgCacheError) {
      return json(
        {
          error: error.message,
        },
        { status: error.statusCode ?? 502 },
      );
    }

    return json({ error: 'Failed to query channels from EPG cache service' }, { status: 500 });
  }
};
