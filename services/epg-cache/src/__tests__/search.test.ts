import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SearchIndex } from '../search.js';
import { EpgStore } from '../store.js';
import type { EpgEvent } from '@tvh-guide/tvheadend-client';

function makeEvent(overrides: Partial<EpgEvent> = {}): EpgEvent {
  return {
    eventId: 1,
    channelUuid: 'ch-1',
    channelName: 'Das Erste HD',
    start: 1700000000,
    stop: 1700003600,
    title: 'Tagesschau',
    ...overrides,
  };
}

describe('SearchIndex', () => {
  let store: EpgStore;
  let searchIndex: SearchIndex;

  beforeEach(() => {
    store = new EpgStore(':memory:');
    searchIndex = new SearchIndex();
  });

  afterEach(() => {
    store.close();
  });

  it('should start with zero documents', () => {
    expect(searchIndex.getDocumentCount()).toBe(0);
  });

  it('should rebuild index from store', () => {
    store.replaceAllEvents([
      makeEvent({ eventId: 1, title: 'Tagesschau' }),
      makeEvent({ eventId: 2, title: 'Tatort' }),
      makeEvent({ eventId: 3, title: 'Sportschau' }),
    ]);

    searchIndex.rebuild(store);
    expect(searchIndex.getDocumentCount()).toBe(3);
  });

  it('should find events by exact title', () => {
    store.replaceAllEvents([
      makeEvent({ eventId: 1, title: 'Tagesschau' }),
      makeEvent({ eventId: 2, title: 'Tatort' }),
    ]);
    searchIndex.rebuild(store);

    const results = searchIndex.search('Tagesschau');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].eventId).toBe(1);
    expect(results[0].score).toBeGreaterThan(0);
  });

  it('should find events with fuzzy matching', () => {
    store.replaceAllEvents([makeEvent({ eventId: 1, title: 'Tagesschau' })]);
    searchIndex.rebuild(store);

    const results = searchIndex.search('Tagesschaw');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].eventId).toBe(1);
  });

  it('should find events with prefix matching', () => {
    store.replaceAllEvents([makeEvent({ eventId: 1, title: 'Tagesschau' })]);
    searchIndex.rebuild(store);

    const results = searchIndex.search('Tages');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].eventId).toBe(1);
  });

  it('should rank title matches higher than description matches', () => {
    store.replaceAllEvents([
      makeEvent({ eventId: 1, title: 'Krimi', description: 'Ein spannender Film' }),
      makeEvent({ eventId: 2, title: 'Spielfilm', description: 'Ein Krimi aus Berlin' }),
    ]);
    searchIndex.rebuild(store);

    const results = searchIndex.search('Krimi');
    expect(results.length).toBe(2);
    expect(results[0].eventId).toBe(1);
  });

  it('should respect limit parameter', () => {
    store.replaceAllEvents([
      makeEvent({ eventId: 1, title: 'News 1' }),
      makeEvent({ eventId: 2, title: 'News 2' }),
      makeEvent({ eventId: 3, title: 'News 3' }),
    ]);
    searchIndex.rebuild(store);

    const results = searchIndex.search('News', 2);
    expect(results).toHaveLength(2);
  });

  it('should return empty array for no matches', () => {
    store.replaceAllEvents([makeEvent({ eventId: 1, title: 'Tagesschau' })]);
    searchIndex.rebuild(store);

    const results = searchIndex.search('zzzzxyz');
    expect(results).toHaveLength(0);
  });

  it('should search across subtitle, summary, description', () => {
    store.replaceAllEvents([
      makeEvent({
        eventId: 1,
        title: 'Film',
        subtitle: 'Spannung',
        summary: 'Ein Thriller',
        description: 'Detaillierte Beschreibung',
      }),
    ]);
    searchIndex.rebuild(store);

    expect(searchIndex.search('Spannung').length).toBeGreaterThanOrEqual(1);
    expect(searchIndex.search('Thriller').length).toBeGreaterThanOrEqual(1);
    expect(searchIndex.search('Beschreibung').length).toBeGreaterThanOrEqual(1);
  });

  it('should replace index on rebuild', () => {
    store.replaceAllEvents([makeEvent({ eventId: 1, title: 'Old Show' })]);
    searchIndex.rebuild(store);
    expect(searchIndex.getDocumentCount()).toBe(1);

    store.replaceAllEvents([
      makeEvent({ eventId: 2, title: 'New Show' }),
      makeEvent({ eventId: 3, title: 'Another Show' }),
    ]);
    searchIndex.rebuild(store);
    expect(searchIndex.getDocumentCount()).toBe(2);
    expect(searchIndex.search('Old')).toHaveLength(0);
  });
});
