import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import type { EpgEvent } from '@tvh-guide/tvheadend-client';
import type { SyncMeta, IndexableEvent, CachedChannel } from './types.js';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS events (
  event_id INTEGER PRIMARY KEY,
  channel_uuid TEXT NOT NULL,
  channel_name TEXT NOT NULL,
  channel_number INTEGER,
  channel_icon TEXT,
  start INTEGER NOT NULL,
  stop INTEGER NOT NULL,
  duration INTEGER,
  title TEXT NOT NULL,
  subtitle TEXT,
  summary TEXT,
  description TEXT,
  genre TEXT,
  content_type INTEGER,
  series_link TEXT,
  episode_number INTEGER,
  season_number INTEGER,
  part_number INTEGER,
  part_count INTEGER,
  episode_uri TEXT,
  image TEXT,
  next_event_id INTEGER,
  age_rating INTEGER,
  star_rating INTEGER,
  hd INTEGER,
  widescreen INTEGER,
  audio_desc INTEGER,
  subtitled INTEGER
);
CREATE INDEX IF NOT EXISTS idx_events_timerange ON events(start, stop);
CREATE INDEX IF NOT EXISTS idx_events_channel_timerange ON events(channel_uuid, start, stop);
CREATE INDEX IF NOT EXISTS idx_events_content_type ON events(content_type);

CREATE TABLE IF NOT EXISTS channels (
  uuid TEXT PRIMARY KEY,
  enabled INTEGER DEFAULT 1,
  name TEXT NOT NULL,
  number INTEGER,
  icon TEXT,
  icon_public_url TEXT
);
CREATE INDEX IF NOT EXISTS idx_channels_number ON channels(number);

CREATE TABLE IF NOT EXISTS sync_meta (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  last_refresh_start INTEGER DEFAULT 0,
  last_refresh_end INTEGER DEFAULT 0,
  last_refresh_duration INTEGER DEFAULT 0,
  event_count INTEGER DEFAULT 0,
  channel_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'idle'
);
INSERT OR IGNORE INTO sync_meta (id) VALUES (1);
`;

export class EpgStore {
  private db: Database.Database;

  constructor(dbPath: string = ':memory:') {
    if (dbPath !== ':memory:') {
      mkdirSync(dirname(dbPath), { recursive: true });
    }
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.db.exec(SCHEMA);
  }

  replaceAllEvents(events: EpgEvent[]): void {
    const tx = this.db.transaction(() => {
      this.db.exec('DELETE FROM events');
      const stmt = this.db.prepare(`
        INSERT INTO events (
          event_id, channel_uuid, channel_name, channel_number, channel_icon,
          start, stop, duration, title, subtitle, summary, description,
          genre, content_type, series_link, episode_number, season_number,
          part_number, part_count, episode_uri, image, next_event_id,
          age_rating, star_rating, hd, widescreen, audio_desc, subtitled
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      for (const e of events) {
        stmt.run(
          e.eventId, e.channelUuid, e.channelName, e.channelNumber ?? null, e.channelIcon ?? null,
          e.start, e.stop, e.duration ?? null, e.title, e.subtitle ?? null,
          e.summary ?? null, e.description ?? null,
          e.genre ? JSON.stringify(e.genre) : null, e.contentType ?? null,
          e.seriesLink ?? null, e.episodeNumber ?? null, e.seasonNumber ?? null,
          e.partNumber ?? null, e.partCount ?? null, e.episodeUri ?? null,
          e.image ?? null, e.nextEventId ?? null,
          e.ageRating ?? null, e.starRating ?? null,
          e.hd ? 1 : 0, e.widescreen ? 1 : 0, e.audioDesc ? 1 : 0, e.subtitled ? 1 : 0,
        );
      }
    });
    tx();
  }

  replaceAllChannels(channels: Array<{ uuid: string; enabled?: boolean; name: string; number?: number; icon?: string; iconPublicUrl?: string }>): void {
    const tx = this.db.transaction(() => {
      this.db.exec('DELETE FROM channels');
      const stmt = this.db.prepare(`
        INSERT INTO channels (uuid, enabled, name, number, icon, icon_public_url)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      for (const c of channels) {
        stmt.run(
          c.uuid, c.enabled !== false ? 1 : 0, c.name,
          c.number ?? null, c.icon ?? null, c.iconPublicUrl ?? null,
        );
      }
    });
    tx();
  }

  getEventsByTimerange(start: number, stop: number, opts?: { channelUuid?: string; contentType?: number; limit?: number }): EpgEvent[] {
    let sql = 'SELECT * FROM events WHERE start < ? AND stop > ?';
    const params: unknown[] = [stop, start];

    if (opts?.channelUuid) {
      sql += ' AND channel_uuid = ?';
      params.push(opts.channelUuid);
    }
    if (opts?.contentType !== undefined) {
      sql += ' AND content_type = ?';
      params.push(opts.contentType);
    }
    sql += ' ORDER BY start ASC';
    if (opts?.limit) {
      sql += ' LIMIT ?';
      params.push(opts.limit);
    }

    const rows = this.db.prepare(sql).all(...params) as Record<string, unknown>[];
    return rows.map(rowToEpgEvent);
  }

  getEventById(id: number): EpgEvent | undefined {
    const row = this.db.prepare('SELECT * FROM events WHERE event_id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? rowToEpgEvent(row) : undefined;
  }

  getEventsByIds(ids: number[]): EpgEvent[] {
    if (ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const rows = this.db.prepare(`SELECT * FROM events WHERE event_id IN (${placeholders})`).all(...ids) as Record<string, unknown>[];
    return rows.map(rowToEpgEvent);
  }

  getAllChannels(): CachedChannel[] {
    const rows = this.db.prepare('SELECT * FROM channels ORDER BY number ASC, name ASC').all() as Record<string, unknown>[];
    return rows.map(rowToCachedChannel);
  }

  getChannelByUuidOrNumber(identifier: string): CachedChannel | undefined {
    const num = Number(identifier);
    let row: Record<string, unknown> | undefined;
    if (!isNaN(num) && String(num) === identifier) {
      row = this.db.prepare('SELECT * FROM channels WHERE number = ?').get(num) as Record<string, unknown> | undefined;
    } else {
      row = this.db.prepare('SELECT * FROM channels WHERE uuid = ?').get(identifier) as Record<string, unknown> | undefined;
    }
    return row ? rowToCachedChannel(row) : undefined;
  }

  getAllEventsForIndexing(): IndexableEvent[] {
    const rows = this.db.prepare(
      'SELECT event_id, title, subtitle, summary, description FROM events',
    ).all() as Record<string, unknown>[];
    return rows.map((r) => ({
      eventId: r.event_id as number,
      title: (r.title as string) ?? '',
      subtitle: (r.subtitle as string) ?? '',
      summary: (r.summary as string) ?? '',
      description: (r.description as string) ?? '',
    }));
  }

  getSyncMeta(): SyncMeta {
    const row = this.db.prepare('SELECT * FROM sync_meta WHERE id = 1').get() as Record<string, unknown>;
    return {
      lastRefreshStart: row.last_refresh_start as number,
      lastRefreshEnd: row.last_refresh_end as number,
      lastRefreshDuration: row.last_refresh_duration as number,
      eventCount: row.event_count as number,
      channelCount: row.channel_count as number,
      status: row.status as SyncMeta['status'],
    };
  }

  updateSyncStatus(status: SyncMeta['status']): void {
    if (status === 'refreshing') {
      this.db.prepare(
        'UPDATE sync_meta SET status = ?, last_refresh_start = ? WHERE id = 1',
      ).run(status, Math.floor(Date.now() / 1000));
    } else {
      this.db.prepare('UPDATE sync_meta SET status = ? WHERE id = 1').run(status);
    }
  }

  updateSyncComplete(eventCount: number, channelCount: number): void {
    const now = Math.floor(Date.now() / 1000);
    const meta = this.getSyncMeta();
    const duration = now - meta.lastRefreshStart;
    this.db.prepare(
      'UPDATE sync_meta SET status = ?, last_refresh_end = ?, last_refresh_duration = ?, event_count = ?, channel_count = ? WHERE id = 1',
    ).run('idle', now, duration, eventCount, channelCount);
  }

  getEventCount(): number {
    const row = this.db.prepare('SELECT COUNT(*) as cnt FROM events').get() as { cnt: number };
    return row.cnt;
  }

  getChannelCount(): number {
    const row = this.db.prepare('SELECT COUNT(*) as cnt FROM channels').get() as { cnt: number };
    return row.cnt;
  }

  close(): void {
    this.db.close();
  }
}

function rowToEpgEvent(row: Record<string, unknown>): EpgEvent {
  return {
    eventId: row.event_id as number,
    channelUuid: row.channel_uuid as string,
    channelName: row.channel_name as string,
    channelNumber: row.channel_number as number | undefined,
    channelIcon: row.channel_icon as string | undefined,
    start: row.start as number,
    stop: row.stop as number,
    duration: row.duration as number | undefined,
    title: row.title as string,
    subtitle: row.subtitle as string | undefined,
    summary: row.summary as string | undefined,
    description: row.description as string | undefined,
    genre: row.genre ? JSON.parse(row.genre as string) : undefined,
    contentType: row.content_type as number | undefined,
    seriesLink: row.series_link as string | undefined,
    episodeNumber: row.episode_number as number | undefined,
    seasonNumber: row.season_number as number | undefined,
    partNumber: row.part_number as number | undefined,
    partCount: row.part_count as number | undefined,
    episodeUri: row.episode_uri as string | undefined,
    image: row.image as string | undefined,
    nextEventId: row.next_event_id as number | undefined,
    ageRating: row.age_rating as number | undefined,
    starRating: row.star_rating as number | undefined,
    hd: row.hd === 1 ? true : row.hd === 0 ? false : undefined,
    widescreen: row.widescreen === 1 ? true : row.widescreen === 0 ? false : undefined,
    audioDesc: row.audio_desc === 1 ? true : row.audio_desc === 0 ? false : undefined,
    subtitled: row.subtitled === 1 ? true : row.subtitled === 0 ? false : undefined,
  };
}

function rowToCachedChannel(row: Record<string, unknown>): CachedChannel {
  return {
    uuid: row.uuid as string,
    enabled: row.enabled === 1,
    name: row.name as string,
    number: row.number as number | null,
    icon: row.icon as string | null,
    iconPublicUrl: row.icon_public_url as string | null,
  };
}
