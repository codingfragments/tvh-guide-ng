/**
 * Events list command - List EPG events
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClient, getConfig } from '../../utils/client.js';
import { formatOutput, formatDateTime, truncate, type ColumnDefinition } from '../../utils/output.js';
import { handleError } from '../../utils/errors.js';
import type { EpgEvent } from '@tvh-guide/tvheadend-client';

export function createListCommand(): Command {
  return new Command('list')
    .description('List EPG events')
    .option('--channel <id>', 'Filter by channel UUID or number')
    .option('--now', 'Show currently airing events')
    .option('--upcoming', 'Show upcoming events')
    .option('--limit <n>', 'Limit results', '20')
    .option('--sort <field>', 'Sort by: start, title, channelName, channelNumber', 'start')
    .option('--format <type>', 'Output format: table, json', 'table')
    .action(async (options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora('Fetching EPG events...').start();

      try {
        const client = createClient(globalOpts);
        const config = getConfig(globalOpts);

        let channelUuid: string | undefined = options.channel;
        let channelName: string | undefined;

        // If channel ID is a number, find the UUID
        if (options.channel) {
          const channelNumber = parseInt(options.channel);
          if (!isNaN(channelNumber)) {
            const channelsResponse = await client.getChannelGrid({
              limit: 999,
              start: 0,
            });
            const channel = channelsResponse.entries.find(
              (ch) => ch.number === channelNumber
            );
            if (channel) {
              channelUuid = channel.uuid;
              channelName = channel.name;
            } else {
              spinner.stop();
              console.log(`Channel not found: ${options.channel}`);
              return;
            }
          }
        }

        // Determine query mode
        let mode: 'now' | 'upcoming' | undefined;
        if (options.now) {
          mode = 'now';
        } else if (options.upcoming) {
          mode = 'upcoming';
        }

        const response = await client.getEpgEventsGrid({
          limit: parseInt(options.limit),
          start: 0,
          sort: options.sort,
          channel: channelUuid, // Use dedicated channel parameter
          mode, // Use API's built-in mode parameter
        });

        spinner.stop();

        if (response.entries.length === 0) {
          console.log('No events found');
          return;
        }

        const columns: ColumnDefinition<EpgEvent>[] = [
          {
            key: 'channelNumber',
            label: 'Ch#',
            width: 6,
          },
          {
            key: 'channelName',
            label: 'Channel',
            width: 18,
            format: (val) => truncate(val || '', 16),
          },
          {
            key: 'title',
            label: 'Title',
            width: 28,
            format: (val) => truncate(val || '', 26),
          },
          {
            key: 'start',
            label: 'Start',
            width: 18,
            format: (val) => formatDateTime(val),
          },
          {
            key: 'stop',
            label: 'End',
            width: 18,
            format: (val) => formatDateTime(val),
          },
        ];

        const output = formatOutput(
          response.entries,
          globalOpts.format || options.format,
          columns,
          config.defaults?.color !== false
        );

        console.log(output);

        let summary = `\nTotal: ${response.total} events`;
        if (channelName) {
          summary += ` (Channel: ${channelName})`;
        }
        console.log(summary);
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
