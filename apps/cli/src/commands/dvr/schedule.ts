/**
 * DVR schedule command - Schedule recording from EPG event
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClient } from '../../utils/client.js';
import { handleError, success } from '../../utils/errors.js';

export function createScheduleCommand(): Command {
  return new Command('schedule')
    .description('Schedule recording from EPG event')
    .argument('<eventId>', 'EPG event ID to record')
    .option('--priority <0-6>', 'Recording priority (default: 2)', '2')
    .option('--profile <uuid>', 'DVR config profile UUID')
    .action(async (eventId, options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora('Scheduling recording...').start();

      try {
        const client = createClient(globalOpts);

        const eventIdNum = parseInt(eventId);
        if (isNaN(eventIdNum)) {
          spinner.stop();
          console.log(`Invalid event ID: ${eventId}`);
          process.exit(1);
        }

        // Create DVR entry from event
        const params: any = {
          event_id: eventIdNum,
          pri: parseInt(options.priority),
        };

        if (options.profile) {
          params.config_name = options.profile;
        }

        await client.createDvrEntryByEvent(params);

        spinner.stop();
        success(`Recording scheduled for event ${eventId}`);
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
