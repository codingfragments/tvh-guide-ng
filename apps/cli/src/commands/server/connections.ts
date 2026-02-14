/**
 * Server connections command - Show active connections
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClientAndConfig } from '../../utils/client.js';
import { formatOutput, type ColumnDefinition } from '../../utils/output.js';
import { handleError } from '../../utils/errors.js';
import type { ConnectionStatus } from '@tvh-guide/tvheadend-client';

export function createConnectionsCommand(): Command {
  return new Command('connections')
    .description('Show active connections')
    .option('--format <type>', 'Output format: table, json', 'table')
    .action(async (options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora('Fetching active connections...').start();

      try {
        const { client, config } = createClientAndConfig(globalOpts);

        const response = await client.getConnections();

        spinner.stop();

        if (response.entries.length === 0) {
          console.log('No active connections');
          return;
        }

        const columns: ColumnDefinition<ConnectionStatus>[] = [
          { key: 'id', label: 'ID', width: 10 },
          { key: 'type', label: 'Type', width: 12 },
          { key: 'peer', label: 'Client IP', width: 20 },
          { key: 'user', label: 'User', width: 20 },
          { key: 'started', label: 'Started', width: 12 },
        ];

        const output = formatOutput(
          response.entries,
          globalOpts.format || options.format,
          columns,
          config.defaults?.color !== false,
        );

        console.log(output);
        console.log(`\nTotal: ${response.entries.length} connections`);
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
