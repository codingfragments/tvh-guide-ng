/**
 * Auth status command - Test connection and show server info
 */

import { Command } from 'commander';
import ora from 'ora';
import { createClient } from '../../utils/client.js';
import { handleError, success } from '../../utils/errors.js';
import chalk from 'chalk';

export function createStatusCommand(): Command {
  return new Command('status')
    .description('Test connection and show server information')
    .action(async (options, command) => {
      const spinner = ora('Connecting to TVHeadend server...').start();

      try {
        const client = createClient(command.optsWithGlobals());

        const serverInfo = await client.getServerInfo();

        spinner.stop();

        console.log(chalk.bold('\n📡 Connection Status'));
        success('Connected successfully');

        console.log(chalk.bold('\n🖥️  Server Information'));
        console.log(`  Version:      ${serverInfo.sw_version || 'Unknown'}`);
        console.log(`  API Version:  ${serverInfo.api_version || 'Unknown'}`);
        console.log(`  Name:         ${serverInfo.name || 'Unknown'}`);

        if (serverInfo.capabilities && serverInfo.capabilities.length > 0) {
          console.log(
            `  Capabilities: ${serverInfo.capabilities.join(', ')}`
          );
        }
      } catch (error) {
        spinner.stop();
        handleError(error, command.optsWithGlobals().verbose);
      }
    });
}
