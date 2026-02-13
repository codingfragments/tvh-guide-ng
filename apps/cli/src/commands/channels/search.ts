/**
 * Channels search command - Search channels by name
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClient, getConfig } from '../../utils/client.js';
import { formatOutput, formatBoolean, type ColumnDefinition } from '../../utils/output.js';
import { handleError } from '../../utils/errors.js';
import type { Channel } from '@tvh-guide/tvheadend-client';

export function createSearchCommand(): Command {
  return new Command('search')
    .description('Search channels by name')
    .argument('<query>', 'Search query')
    .option('--format <type>', 'Output format: table, json', 'table')
    .option('--limit <n>', 'Limit results', '50')
    .action(async (query, options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora(`Searching for "${query}"...`).start();

      try {
        const client = createClient(globalOpts);
        const config = getConfig(globalOpts);

        const response = await client.getChannelGrid({
          limit: parseInt(options.limit),
          start: 0,
        });

        // Filter channels by name (case-insensitive)
        const filteredChannels = response.entries.filter((channel) =>
          channel.name?.toLowerCase().includes(query.toLowerCase())
        );

        spinner.stop();

        if (filteredChannels.length === 0) {
          console.log(`No channels found matching "${query}"`);
          return;
        }

        const columns: ColumnDefinition<Channel>[] = [
          { key: 'number', label: 'Number', width: 10 },
          { key: 'name', label: 'Name', width: 35 },
          {
            key: 'enabled',
            label: 'Enabled',
            width: 10,
            format: (val) => formatBoolean(val, config.defaults?.color !== false),
          },
          { key: 'uuid', label: 'UUID', width: 38 },
        ];

        const output = formatOutput(
          filteredChannels,
          options.format,
          columns,
          config.defaults?.color !== false
        );

        console.log(output);
        console.log(`\nFound: ${filteredChannels.length} channels`);
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
