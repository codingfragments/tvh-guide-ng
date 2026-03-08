import { env as privateEnv } from '$env/dynamic/private';
import type { NowEventDetail } from '$lib/components/now/types';
import type { NowResponse } from '$lib/components/now/types';
import { parsePositiveInt } from '$lib/server/epg-cache';
import type { ChannelEventsResponse, ChannelListEntry, ChannelsResponse } from '$lib/components/channels/types';
import type { PageServerLoad } from './$types';

const DEFAULT_UPCOMING_LIMIT = 5;
const MAX_UPCOMING_LIMIT = 50;

export const load: PageServerLoad = async ({ fetch, url }) => {
  const channelsRes = await fetch('/api/channels');
  if (!channelsRes.ok) {
    throw new Error(`Failed to load channel list (${String(channelsRes.status)})`);
  }

  const channelsPayload = (await channelsRes.json()) as ChannelsResponse;
  const channels = channelsPayload.items;
  const progressByChannel: Record<string, number> = {};

  const nowRes = await fetch('/api/now');
  if (nowRes.ok) {
    const nowPayload = (await nowRes.json()) as NowResponse;
    for (const item of nowPayload.items) {
      progressByChannel[item.channelUuid] = item.progressPct;
    }
  }

  const requestedChannelUuid = url.searchParams.get('channel');
  const selectedChannel = resolveSelectedChannel(channels, requestedChannelUuid);

  const upcomingLimit = parsePositiveInt(privateEnv.CHANNELS_UPCOMING_LIMIT, DEFAULT_UPCOMING_LIMIT, {
    max: MAX_UPCOMING_LIMIT,
  });

  let events: ChannelEventsResponse | null = null;
  let eventsError: string | null = null;
  let currentDetails: NowEventDetail | null = null;
  let currentDetailsError: string | null = null;

  if (selectedChannel) {
    const qs = new URLSearchParams({
      channel: selectedChannel.uuid,
      from: 'now',
      limit: String(upcomingLimit),
    });

    const eventsRes = await fetch(`/api/events?${qs.toString()}`);
    if (eventsRes.ok) {
      events = (await eventsRes.json()) as ChannelEventsResponse;
      if (events.current) {
        const detailRes = await fetch(`/api/now/event/${String(events.current.eventId)}`);
        if (detailRes.ok) {
          currentDetails = (await detailRes.json()) as NowEventDetail;
        } else {
          currentDetailsError = `Failed to load current event details (${String(detailRes.status)})`;
        }
      }
    } else {
      eventsError = `Failed to load channel schedule (${String(eventsRes.status)})`;
    }
  }

  return {
    channels,
    selectedChannel,
    selectedChannelUuid: selectedChannel?.uuid ?? null,
    events,
    eventsError,
    currentDetails,
    currentDetailsError,
    progressByChannel,
    upcomingLimit,
  };
};

function resolveSelectedChannel(channels: ChannelListEntry[], requestedChannelUuid: string | null): ChannelListEntry | null {
  if (channels.length === 0) return null;

  if (requestedChannelUuid) {
    const matched = channels.find((channel) => channel.uuid === requestedChannelUuid);
    if (matched) return matched;
  }

  return channels[0];
}
