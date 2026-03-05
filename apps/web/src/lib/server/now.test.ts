import { describe, it, expect } from 'vitest';
import { calculateProgressPct, parseLimit, parseTimestampOrNow, toNowEventItems, type EpgCacheEvent } from './now.js';

describe('parseTimestampOrNow', () => {
  it('returns now timestamp when ts is missing', () => {
    const result = parseTimestampOrNow(null, 1700000000);
    expect(result.timestamp).toBe(1700000000);
    expect(result.isNowMode).toBe(true);
  });

  it('parses valid ts and marks fixed mode', () => {
    const result = parseTimestampOrNow('1700000100', 1700000000);
    expect(result.timestamp).toBe(1700000100);
    expect(result.isNowMode).toBe(false);
  });

  it('throws on invalid ts', () => {
    expect(() => parseTimestampOrNow('abc')).toThrow('Invalid ts parameter');
  });
});

describe('parseLimit', () => {
  it('uses default limit when missing', () => {
    expect(parseLimit(null)).toBe(200);
  });

  it('caps the limit to 1000', () => {
    expect(parseLimit('5000')).toBe(1000);
  });
});

describe('calculateProgressPct', () => {
  it('calculates progress and clamps 0..100', () => {
    expect(calculateProgressPct(100, 200, 150)).toBe(50);
    expect(calculateProgressPct(100, 200, 50)).toBe(0);
    expect(calculateProgressPct(100, 200, 250)).toBe(100);
  });
});

describe('toNowEventItems', () => {
  it('maps and sorts by channel number ascending', () => {
    const events: EpgCacheEvent[] = [
      {
        eventId: 2,
        channelUuid: 'ch-2',
        channelName: 'ZDF HD',
        channelNumber: 2,
        start: 100,
        stop: 200,
        title: 'Show 2',
      },
      {
        eventId: 1,
        channelUuid: 'ch-1',
        channelName: 'Das Erste HD',
        channelNumber: 1,
        start: 100,
        stop: 200,
        title: 'Show 1',
      },
    ];

    const items = toNowEventItems(events, 150);
    expect(items[0].channelNumber).toBe(1);
    expect(items[1].channelNumber).toBe(2);
    expect(items[0].piconUrl).toBe('picon://channel/Das Erste HD');
  });
});
