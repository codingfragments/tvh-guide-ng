/**
 * Channels list command - List all channels
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClientAndConfig } from '../../utils/client.js';
import { formatOutput, formatBoolean, type ColumnDefinition } from '../../utils/output.js';
import { handleError } from '../../utils/errors.js';
import type { Channel } from '@tvh-guide/tvheadend-client';

export function createListCommand(): Command {
  return new Command('list')
    .description('List all channels')
    .option('--sort <field>', 'Sort by: number, name', 'number')
    .option('--tag <uuid>', 'Filter by channel tag UUID')
    .option('--format <type>', 'Output format: table, json', 'table')
    .option('--limit <n>', 'Limit results', '50')
    .action(async (options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora('Fetching channels...').start();

      try {
        const { client, config } = createClientAndConfig(globalOpts);

        const response = await client.getChannelGrid({
          sort: options.sort,
          limit: parseInt(options.limit),
          start: 0,
          tags: options.tag || undefined,
        });

        spinner.stop();

        if (response.entries.length === 0) {
          console.log('No channels found');
          return;
        }

        const columns: ColumnDefinition<Channel>[] = [
          { key: 'number', label: 'Number', width: 10 },
          { key: 'name', label: 'Name', width: 35 },
          {
            key: 'enabled',
            label: 'Enabled',
            width: 10,
            format: (val) => formatBoolean(val as boolean, config.defaults?.color !== false),
          },
          { key: 'uuid', label: 'UUID', width: 38 },
        ];

        const output = formatOutput(
          response.entries,
          globalOpts.format || options.format,
          columns,
          config.defaults?.color !== false
        );

        console.log(output);
        console.log(`\nTotal: ${response.total} channels`);
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
