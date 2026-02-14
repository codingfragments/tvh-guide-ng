import type { TVHeadendClient } from '@tvh-guide/tvheadend-client';
import type { EpgStore } from './store.js';
import type { SearchIndex } from './search.js';
import { fetchAllEvents, fetchAllChannels } from './loader.js';

export class RefreshScheduler {
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private refreshing = false;
  private nextRefreshTime: number | null = null;

  constructor(
    private readonly client: TVHeadendClient,
    private readonly store: EpgStore,
    private readonly searchIndex: SearchIndex,
    private readonly intervalSeconds: number,
  ) {}

  start(): void {
    void this.refresh();
    this.intervalHandle = setInterval(() => {
      void this.refresh();
    }, this.intervalSeconds * 1000);
    this.updateNextRefreshTime();
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    this.nextRefreshTime = null;
  }

  async refresh(): Promise<void> {
    if (this.refreshing) return;
    this.refreshing = true;
    this.store.updateSyncStatus('refreshing');

    try {
      const [events, channels] = await Promise.all([fetchAllEvents(this.client), fetchAllChannels(this.client)]);

      this.store.replaceAllEvents(events);
      this.store.replaceAllChannels(channels);
      this.searchIndex.rebuild(this.store);
      this.store.updateSyncComplete(events.length, channels.length);
    } catch (error) {
      console.error('Refresh failed:', error);
      this.store.updateSyncStatus('idle');
    } finally {
      this.refreshing = false;
      this.updateNextRefreshTime();
    }
  }

  isRefreshing(): boolean {
    return this.refreshing;
  }

  getNextRefreshTime(): Date | null {
    return this.nextRefreshTime ? new Date(this.nextRefreshTime) : null;
  }

  private updateNextRefreshTime(): void {
    if (this.intervalHandle) {
      this.nextRefreshTime = Date.now() + this.intervalSeconds * 1000;
    }
  }
}
