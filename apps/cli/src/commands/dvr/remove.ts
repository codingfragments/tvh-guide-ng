/**
 * DVR remove command - Remove/delete recording
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClient } from '../../utils/client.js';
import { handleError, success } from '../../utils/errors.js';
import { confirm } from '../../utils/prompts.js';

export function createRemoveCommand(): Command {
  return new Command('remove')
    .description('Remove/delete recording')
    .argument('<uuid>', 'DVR entry UUID')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (uuid, options, command) => {
      const globalOpts = command.optsWithGlobals();

      try {
        // Confirm deletion unless --yes flag is provided
        if (!options.yes && !globalOpts.quiet) {
          const confirmed = await confirm(
            `Are you sure you want to remove recording ${uuid}?`,
            false
          );
          if (!confirmed) {
            console.log('Cancelled');
            return;
          }
        }

        const spinner = ora('Removing recording...').start();
        const client = createClient(globalOpts);

        await client.removeDvrEntry({ uuid });

        spinner.stop();
        success(`Recording ${uuid} removed`);
      } catch (error) {
        handleError(error, globalOpts.verbose);
      }
    });
}
