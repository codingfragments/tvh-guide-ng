/**
 * DVR stop command - Stop active recording
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClient } from '../../utils/client.js';
import { handleError, success } from '../../utils/errors.js';
import { confirm } from '../../utils/prompts.js';

export function createStopCommand(): Command {
  return new Command('stop')
    .description('Stop active recording')
    .argument('<uuid>', 'DVR entry UUID')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (uuid, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Confirm action unless --yes flag is provided
        if (!options.yes && !globalOpts.quiet) {
          const confirmed = await confirm(`Are you sure you want to stop recording ${uuid}?`, false);
          if (!confirmed) {
            console.log('Cancelled');
            return;
          }
        }

        const spinner = ora('Stopping recording...').start();
        const client = createClient(globalOpts);

        await client.stopDvrEntry({ uuid });

        spinner.stop();
        success(`Recording ${uuid} stopped`);
      } catch (error) {
        handleError(error, globalOpts.verbose);
      }
    });
}
