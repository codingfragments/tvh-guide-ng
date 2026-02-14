import MiniSearch from 'minisearch';
import type { EpgStore } from './store.js';
import type { IndexableEvent } from './types.js';

export class SearchIndex {
  private index: MiniSearch<IndexableEvent>;

  constructor() {
    this.index = createIndex();
  }

  rebuild(store: EpgStore): void {
    const fresh = createIndex();
    const events = store.getAllEventsForIndexing();
    fresh.addAll(events);
    this.index = fresh;
  }

  search(query: string, limit: number = 20): Array<{ eventId: number; score: number }> {
    const results = this.index.search(query, {
      fuzzy: 0.2,
      prefix: true,
      combineWith: 'OR',
      boost: { title: 4, subtitle: 3, summary: 2, description: 1 },
    });

    return results.slice(0, limit).map((r) => ({
      eventId: r.id as number,
      score: r.score,
    }));
  }

  getDocumentCount(): number {
    return this.index.documentCount;
  }
}

function createIndex(): MiniSearch<IndexableEvent> {
  return new MiniSearch<IndexableEvent>({
    idField: 'eventId',
    fields: ['title', 'subtitle', 'summary', 'description'],
    storeFields: ['eventId'],
  });
}
