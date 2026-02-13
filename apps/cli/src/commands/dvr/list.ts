/**
 * DVR list command - List recordings
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClient, getConfig } from '../../utils/client.js';
import { formatOutput, formatDateTime, truncate, type ColumnDefinition } from '../../utils/output.js';
import { handleError } from '../../utils/errors.js';
import type { DvrEntry } from '@tvh-guide/tvheadend-client';

export function createListCommand(): Command {
  return new Command('list')
    .description('List recordings')
    .option('--status <type>', 'Filter by status: upcoming, recording, finished, failed')
    .option('--limit <n>', 'Limit results', '20')
    .option('--sort <field>', 'Sort by: start, title, channel', 'start')
    .option('--format <type>', 'Output format: table, json', 'table')
    .action(async (options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora('Fetching DVR entries...').start();

      try {
        const client = createClient(globalOpts);
        const config = getConfig(globalOpts);

        let filter: any[] = [];

        // Filter by status if requested
        if (options.status) {
          const statusMap: Record<string, string> = {
            upcoming: 'scheduled',
            recording: 'recording',
            finished: 'completed',
            failed: 'missed',
          };

          const status = statusMap[options.status.toLowerCase()];
          if (status) {
            filter.push({ field: 'status', type: 'string', value: status });
          }
        }

        const response = await client.getDvrEntryGrid({
          limit: parseInt(options.limit),
          start: 0,
          sort: options.sort,
          filter: filter.length > 0 ? JSON.stringify(filter) : undefined,
        });

        spinner.stop();

        if (response.entries.length === 0) {
          console.log('No recordings found');
          return;
        }

        const columns: ColumnDefinition<DvrEntry>[] = [
          {
            key: 'channelname',
            label: 'Channel',
            width: 20,
            format: (val) => truncate(val || '', 18),
          },
          {
            key: 'title',
            label: 'Title',
            width: 30,
            format: (val) => truncate(val?.title || '', 28),
          },
          {
            key: 'start',
            label: 'Start',
            width: 20,
            format: (val) => formatDateTime(val),
          },
          {
            key: 'sched_status',
            label: 'Status',
            width: 15,
          },
        ];

        const output = formatOutput(
          response.entries,
          options.format,
          columns,
          config.defaults?.color !== false
        );

        console.log(output);
        console.log(`\nTotal: ${response.total} recordings`);
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
