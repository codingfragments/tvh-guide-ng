/**
 * Events show command - Show detailed event information
 */

import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { createClient } from '../../utils/client.js';
import { formatJSON, formatDateTime } from '../../utils/output.js';
import { handleError } from '../../utils/errors.js';

export function createShowCommand(): Command {
  return new Command('show')
    .description('Show detailed event information')
    .argument('<eventId>', 'Event ID')
    .option('--format <type>', 'Output format: table, json', 'table')
    .action(async (eventId, options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora('Fetching event information...').start();

      try {
        const client = createClient(globalOpts);

        // Fetch the event details
        const eventIdNum = parseInt(eventId);
        if (isNaN(eventIdNum)) {
          spinner.stop();
          console.log(chalk.red(`Invalid event ID: ${eventId}`));
          process.exit(1);
        }

        // Use the dedicated loadEpgEvents method
        const events = await client.loadEpgEvents(eventIdNum);

        spinner.stop();

        if (events.length === 0) {
          console.log(chalk.red(`Event not found: ${eventId}`));
          process.exit(1);
        }

        const event = events[0];

        const format = globalOpts.format || options.format;

        if (format === 'json') {
          console.log(formatJSON(event));
        } else {
          console.log(chalk.bold('\n📅 Event Information'));
          console.log(`  ID:       ${event.eventId}`);
          console.log(`  Title:    ${event.title}`);
          console.log(`  Channel:  ${event.channelName}`);
          console.log(`  Start:    ${formatDateTime(event.start)}`);
          console.log(`  End:      ${formatDateTime(event.stop)}`);

          const duration = event.stop - event.start;
          const minutes = Math.floor(duration / 60);
          console.log(`  Duration: ${minutes} minutes`);

          if (event.subtitle) {
            console.log(`  Subtitle: ${event.subtitle}`);
          }

          if (event.description) {
            console.log(`\n  Description:\n  ${event.description}`);
          }

          if (event.summary) {
            console.log(`\n  Summary:\n  ${event.summary}`);
          }

          if (event.genre && event.genre.length > 0) {
            console.log(`\n  Genres:   ${event.genre.join(', ')}`);
          }
        }
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
