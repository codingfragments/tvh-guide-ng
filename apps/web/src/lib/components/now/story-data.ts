import type { NowEventItem } from './types.js';

export const nowStoryItems: NowEventItem[] = [
  {
    eventId: 1,
    channelUuid: 'ch-1',
    channelName: 'Das Erste HD',
    channelNumber: 1,
    title: 'Brisant',
    subtitle: 'Moderation: Marwa Eldessouky',
    summary: 'Boulevardmagazin',
    start: 1762413300,
    stop: 1762416000,
    progressPct: 35,
    piconUrl: 'picon://channel/Das Erste HD',
  },
  {
    eventId: 2,
    channelUuid: 'ch-2',
    channelName: 'ZDF HD',
    channelNumber: 2,
    title: 'taff',
    subtitle: 'taff Infotainment, D 2026 Altersfreigabe: ab 12',
    summary: 'Infotainment',
    start: 1762412340,
    stop: 1762416000,
    progressPct: 50,
    piconUrl: 'picon://channel/ZDF HD',
  },
];
