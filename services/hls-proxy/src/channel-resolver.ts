import { Buffer } from 'node:buffer';
import { TVHeadendClient, type Channel } from '@tvh-guide/tvheadend-client';
import type pino from 'pino';
import type { HlsProxyConfig, ResolvedChannelStream } from './types.js';

const INTSPLIT = 1_000_000;
const PAGE_SIZE = 200;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ChannelResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChannelResolutionError';
  }
}

export class ChannelResolver {
  private readonly client: TVHeadendClient;

  constructor(
    private readonly config: HlsProxyConfig,
    private readonly logger: pino.Logger,
  ) {
    this.client = new TVHeadendClient({
      baseUrl: config.tvheadend.baseUrl,
      username: config.tvheadend.username,
      password: config.tvheadend.password,
    });
  }

  createAuthHeader(): string {
    return `Basic ${Buffer.from(`${this.config.tvheadend.username}:${this.config.tvheadend.password}`).toString('base64')}`;
  }

  async resolveChannelStream(channelInputRaw: string): Promise<ResolvedChannelStream> {
    const channelInput = channelInputRaw.trim();
    if (!channelInput) throw new ChannelResolutionError('Channel input is required');

    const channel = await this.resolveChannel(channelInput);
    if (!channel) {
      throw new ChannelResolutionError(`Channel "${channelInput}" not found`);
    }

    const streamPath = this.buildStreamPath(channel.uuid);
    const streamUrl = `${this.config.tvheadend.baseUrl}${streamPath}`;

    this.logger.debug({
      event: 'channel_resolved',
      channelInput,
      channelUuid: channel.uuid,
      channelName: channel.name,
      streamPath,
      profile: this.config.tvheadend.profile,
    });

    return {
      channel,
      channelInput,
      streamPath,
      streamUrl,
    };
  }

  private async resolveChannel(channelInput: string): Promise<Channel | null> {
    if (/^\d+$/.test(channelInput)) {
      const requestedNumber = Number(channelInput);

      const byNumber = await this.queryChannelByNumberIntsplit(requestedNumber);
      if (byNumber && byNumber.number === requestedNumber) return byNumber;

      return this.queryChannelByNumberScan(requestedNumber);
    }

    if (!UUID_PATTERN.test(channelInput)) {
      throw new ChannelResolutionError('Channel input must be a channel number or UUID');
    }

    return this.querySingle({
      field: 'uuid',
      type: 'string',
      value: channelInput,
      comparison: 'eq',
    });
  }

  private buildStreamPath(channelUuid: string): string {
    const pathTemplate = this.config.tvheadend.streamPathTemplate;
    const path = pathTemplate.replaceAll('{channelUuid}', encodeURIComponent(channelUuid));
    const url = new URL(path, 'http://tvh.local');
    url.searchParams.set('profile', this.config.tvheadend.profile);
    return `${url.pathname}${url.search}`;
  }

  private async querySingle(filter: {
    field: 'uuid' | 'number' | 'name';
    type: 'string' | 'numeric';
    value: string | number;
    comparison?: 'eq';
  }): Promise<Channel | null> {
    const response = await this.client.getChannelGrid({
      start: 0,
      limit: 1,
      filter,
    });

    return response.entries[0] ?? null;
  }

  private async queryChannelByNumberIntsplit(channelNumber: number): Promise<Channel | null> {
    const response = await this.client.getChannelGrid({
      start: 0,
      limit: 1,
      filter: JSON.stringify({
        field: 'number',
        type: 'numeric',
        comparison: 'eq',
        value: channelNumber * INTSPLIT,
        intsplit: INTSPLIT,
      }),
    });

    return response.entries[0] ?? null;
  }

  private async queryChannelByNumberScan(channelNumber: number): Promise<Channel | null> {
    let start = 0;
    let total = 0;

    do {
      const response = await this.client.getChannelGrid({
        start,
        limit: PAGE_SIZE,
        sort: 'number',
        dir: 'ASC',
      });

      total = response.total;
      const match = response.entries.find((channel) => channel.number === channelNumber);
      if (match) return match;

      start += PAGE_SIZE;
    } while (start < total);

    return null;
  }
}
