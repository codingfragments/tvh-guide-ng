import type { NowEventItem } from '$lib/components/now/types';
import type { ChannelListEntry } from './types.js';

export const storyChannels: ChannelListEntry[] = [
  {
    uuid: 'ch-1',
    name: 'Das Erste HD',
    number: 1,
    piconUrl: 'picon://channel/Das Erste HD',
  },
  {
    uuid: 'ch-2',
    name: 'ZDF HD',
    number: 2,
    piconUrl: 'picon://channel/ZDF HD',
  },
  {
    uuid: 'ch-7',
    name: 'RTL',
    number: 7,
    piconUrl: 'picon://channel/RTL',
  },
  {
    uuid: 'ch-11',
    name: 'arte HD',
    number: 11,
    piconUrl: 'picon://channel/arte HD',
  },
];

export const storyCurrentEvent: NowEventItem = {
  eventId: 501,
  channelUuid: 'ch-11',
  channelName: 'arte HD',
  channelNumber: 11,
  title: 'GEO Reportage',
  subtitle: 'Wilde Waterkant - Nordfriesland und seine Gänse',
  summary: 'Dokumentation',
  description: 'Im Gegensatz zu den Bauern freut sich Martin Kühn über die vielen Gänse in Nordfriesland.',
  start: 1772258100,
  stop: 1772259900,
  progressPct: 47,
  piconUrl: 'picon://channel/arte HD',
  image: 'http://images.zattic.com/cms/16baafda0716eb7152dd/format_1920x1080.jpg',
  seasonNumber: 1,
  episodeNumber: 8,
};

export const storyUpcomingEvents: NowEventItem[] = [
  {
    eventId: 502,
    channelUuid: 'ch-11',
    channelName: 'arte HD',
    channelNumber: 11,
    title: 'Square for Artists',
    subtitle: 'Weekly Arts Magazine',
    summary: 'Culture and art stories from across Europe.',
    description: 'A compact weekly magazine focused on contemporary art, performances, and exhibitions.',
    start: 1772259900,
    stop: 1772261700,
    progressPct: 0,
    piconUrl: 'picon://channel/arte HD',
  },
  {
    eventId: 503,
    channelUuid: 'ch-11',
    channelName: 'arte HD',
    channelNumber: 11,
    title: 'arte Journal',
    subtitle: 'News from Europe',
    summary: 'European news and analysis.',
    description: 'Daily updates and background coverage from across the continent.',
    start: 1772261700,
    stop: 1772263500,
    progressPct: 0,
    piconUrl: 'picon://channel/arte HD',
  },
  {
    eventId: 504,
    channelUuid: 'ch-11',
    channelName: 'arte HD',
    channelNumber: 11,
    title: 'Cinema Classics',
    subtitle: 'The Last Metro',
    summary: 'Classic cinema showcase.',
    description: 'Curated cinema slot featuring restored European film classics.',
    start: 1772263500,
    stop: 1772270700,
    progressPct: 0,
    piconUrl: 'picon://channel/arte HD',
  },
];
