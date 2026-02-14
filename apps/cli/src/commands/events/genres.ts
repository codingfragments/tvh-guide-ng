/**
 * Events genres command - List content types/genres
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClientAndConfig } from '../../utils/client.js';
import { formatOutput, type ColumnDefinition } from '../../utils/output.js';
import { handleError } from '../../utils/errors.js';
import type { ContentType } from '@tvh-guide/tvheadend-client';

export function createGenresCommand(): Command {
  return new Command('genres')
    .description('List available content types/genres')
    .option('--format <type>', 'Output format: table, json', 'table')
    .action(async (options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora('Fetching content types...').start();

      try {
        const { client, config } = createClientAndConfig(globalOpts);

        const contentTypes = await client.listContentTypes();

        spinner.stop();

        if (contentTypes.length === 0) {
          console.log('No content types found');
          return;
        }

        const columns: ColumnDefinition<ContentType>[] = [
          { key: 'code', label: 'Code', width: 8 },
          { key: 'name', label: 'Name', width: 50 },
        ];

        const output = formatOutput(
          contentTypes,
          globalOpts.format || options.format,
          columns,
          config.defaults?.color !== false,
        );

        console.log(output);
        console.log(`\nTotal: ${contentTypes.length} content types`);
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
