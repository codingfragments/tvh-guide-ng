/**
 * DVR cancel command - Cancel scheduled recording
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClient } from '../../utils/client.js';
import { handleError, success } from '../../utils/errors.js';
import { confirm } from '../../utils/prompts.js';

export function createCancelCommand(): Command {
  return new Command('cancel')
    .description('Cancel scheduled recording')
    .argument('<uuid>', 'DVR entry UUID')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (uuid, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Confirm deletion unless --yes flag is provided
        if (!options.yes && !globalOpts.quiet) {
          const confirmed = await confirm(
            `Are you sure you want to cancel recording ${uuid}?`,
            false
          );
          if (!confirmed) {
            console.log('Cancelled');
            return;
          }
        }

        const spinner = ora('Canceling recording...').start();
        const client = createClient(globalOpts);

        await client.cancelDvrEntry({ uuid });

        spinner.stop();
        success(`Recording ${uuid} cancelled`);
      } catch (error) {
        handleError(error, globalOpts.verbose);
      }
    });
}
