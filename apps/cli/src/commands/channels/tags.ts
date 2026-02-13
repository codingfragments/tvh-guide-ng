/**
 * Channels tags command - List channel tags
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClient, getConfig } from '../../utils/client.js';
import { formatOutput, formatBoolean, type ColumnDefinition } from '../../utils/output.js';
import { handleError } from '../../utils/errors.js';
import type { ChannelTag } from '@tvh-guide/tvheadend-client';

export function createTagsCommand(): Command {
  return new Command('tags')
    .description('List channel tags')
    .option('--format <type>', 'Output format: table, json', 'table')
    .action(async (options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora('Fetching channel tags...').start();

      try {
        const client = createClient(globalOpts);
        const config = getConfig(globalOpts);

        const response = await client.getChannelTagGrid({
          limit: 999,
          start: 0,
        });

        spinner.stop();

        if (response.entries.length === 0) {
          console.log('No channel tags found');
          return;
        }

        const columns: ColumnDefinition<ChannelTag>[] = [
          { key: 'name', label: 'Name', width: 30 },
          {
            key: 'enabled',
            label: 'Enabled',
            width: 10,
            format: (val) => formatBoolean(val, config.defaults?.color !== false),
          },
          {
            key: 'internal',
            label: 'Internal',
            width: 10,
            format: (val) => formatBoolean(val, config.defaults?.color !== false),
          },
          { key: 'uuid', label: 'UUID', width: 38 },
        ];

        const output = formatOutput(
          response.entries,
          options.format,
          columns,
          config.defaults?.color !== false
        );

        console.log(output);
        console.log(`\nTotal: ${response.total} tags`);
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
