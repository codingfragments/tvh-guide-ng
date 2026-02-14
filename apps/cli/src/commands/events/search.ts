/**
 * Events search command - Search events by title
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClientAndConfig } from '../../utils/client.js';
import { formatOutput, formatDateTime, truncate, type ColumnDefinition } from '../../utils/output.js';
import { handleError } from '../../utils/errors.js';
import type { EpgEvent, FilterCondition } from '@tvh-guide/tvheadend-client';

export function createSearchCommand(): Command {
  return new Command('search')
    .description('Search events by title')
    .argument('<query>', 'Search query')
    .option('--channel <id>', 'Limit to specific channel UUID or number')
    .option('--genre <code>', 'Filter by genre/content type code')
    .option('--upcoming', 'Only search upcoming events')
    .option('--limit <n>', 'Limit results', '20')
    .option('--sort <field>', 'Sort by: start, title, channelName, channelNumber', 'start')
    .option('--format <type>', 'Output format: table, json', 'table')
    .action(async (query, options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora(`Searching for "${query}"...`).start();

      try {
        const { client, config } = createClientAndConfig(globalOpts);

        let channelUuid: string | undefined = options.channel;

        // If channel ID is a number, find the UUID
        if (options.channel) {
          const channelNumber = parseInt(options.channel);
          if (!isNaN(channelNumber)) {
            const channelsResponse = await client.getChannelGrid({
              limit: 999,
              start: 0,
            });
            const channel = channelsResponse.entries.find((ch) => ch.number === channelNumber);
            if (channel) {
              channelUuid = channel.uuid;
            } else {
              spinner.stop();
              console.log(`Channel not found: ${options.channel}`);
              return;
            }
          }
        }

        // Build filter
        const now = Math.floor(Date.now() / 1000);
        const filter: FilterCondition[] = [{ field: 'title', type: 'string', comparison: 'regex', value: query }];

        if (options.genre) {
          filter.push({
            field: 'genre',
            type: 'numeric',
            value: parseInt(options.genre),
          });
        }

        if (options.upcoming) {
          filter.push({ field: 'start', type: 'numeric', comparison: 'gt', value: now });
        }

        const response = await client.getEpgEventsGrid({
          limit: parseInt(options.limit),
          start: 0,
          sort: options.sort,
          channel: channelUuid, // Use dedicated channel parameter
          filter: JSON.stringify(filter),
        });

        spinner.stop();

        if (response.entries.length === 0) {
          console.log(`No events found matching "${query}"`);
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
            format: (val) => truncate(String(val ?? ''), 16),
          },
          {
            key: 'title',
            label: 'Title',
            width: 28,
            format: (val) => truncate(String(val ?? ''), 26),
          },
          {
            key: 'start',
            label: 'Start',
            width: 18,
            format: (val) => formatDateTime(val as number),
          },
          {
            key: 'stop',
            label: 'End',
            width: 18,
            format: (val) => formatDateTime(val as number),
          },
        ];

        const output = formatOutput(
          response.entries,
          globalOpts.format || options.format,
          columns,
          config.defaults?.color !== false,
        );

        console.log(output);
        console.log(`\nFound: ${response.entries.length} events`);
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
