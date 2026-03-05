import type { NowEventDetail, NowEventItem } from './types.js';

export const featuredNowStoryItem: NowEventItem = {
  eventId: 265151,
  channelUuid: 'e0eda3e1dc2484ce1a70026fb0bd47a5',
  channelName: 'arte HD',
  channelNumber: 11,
  title: 'GEO Reportage',
  subtitle: 'Wilde Waterkant - Nordfriesland und seine Gänse',
  description: 'Im Gegensatz zu den Bauern freut sich Martin Kühn über die vielen Gänse in Nordfriesland.',
  start: 1772258100,
  stop: 1772259900,
  progressPct: 47,
  piconUrl: 'picon://channel/arte HD',
  image: 'http://images.zattic.com/cms/16baafda0716eb7152dd/format_1920x1080.jpg',
  seasonNumber: 1,
  episodeNumber: 8,
};

export const nowStoryItems: NowEventItem[] = [
  featuredNowStoryItem,
  {
    eventId: 2,
    channelUuid: 'ch-2',
    channelName: 'ZDF HD',
    channelNumber: 2,
    title: 'taff',
    subtitle: 'taff Infotainment, D 2026 Altersfreigabe: ab 12',
    summary: 'Infotainment',
    description: 'Lifestyle, Stars, Trends und Storys aus Popkultur und Netz.',
    start: 1762412340,
    stop: 1762416000,
    progressPct: 50,
    piconUrl: 'picon://channel/ZDF HD',
    seasonNumber: 2026,
    episodeNumber: 53,
  },
];

export const featuredNowStoryDetail: NowEventDetail = {
  eventId: featuredNowStoryItem.eventId,
  description: 'Im Gegensatz zu den Bauern freut sich Martin Kühn über die vielen Gänse in Nordfriesland.',
  image: 'http://images.zattic.com/cms/16baafda0716eb7152dd/format_1920x1080.jpg',
  seasonNumber: 1,
  episodeNumber: 8,
  episodeInfo: 'S1E8',
  ageRating: 6,
  starRating: undefined,
  cast: [],
};

export const nowStoryDetail: NowEventDetail = {
  ...featuredNowStoryDetail,
  starRating: 4,
  cast: [
    { name: 'Marwa Eldessouky', role: 'Host' },
    { name: 'Anna Leitner', role: 'Guest' },
    { name: 'Murat Demir', role: 'Correspondent' },
  ],
};
