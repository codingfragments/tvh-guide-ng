/**
 * Server info command - Show server information
 */

import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { createClient, getConfig } from '../../utils/client.js';
import { formatJSON } from '../../utils/output.js';
import { handleError } from '../../utils/errors.js';

export function createInfoCommand(): Command {
  return new Command('info')
    .description('Show server information')
    .option('--format <type>', 'Output format: table, json', 'table')
    .action(async (options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora('Fetching server information...').start();

      try {
        const client = createClient(globalOpts);
        const config = getConfig(globalOpts);

        const serverInfo = await client.getServerInfo();

        spinner.stop();

        const format = globalOpts.format || options.format;

        if (format === 'json') {
          console.log(formatJSON(serverInfo));
        } else {
          console.log(chalk.bold('\n🖥️  Server Information'));
          console.log(`  Name:         ${serverInfo.name || 'Unknown'}`);
          console.log(`  Version:      ${serverInfo.version || 'Unknown'}`);
          console.log(`  SW Version:   ${serverInfo.sw_version || 'Unknown'}`);
          console.log(`  API Version:  ${serverInfo.api_version || 'Unknown'}`);

          if (serverInfo.capabilities && serverInfo.capabilities.length > 0) {
            console.log(`\n  Capabilities:`);
            serverInfo.capabilities.forEach((cap) => {
              console.log(`    • ${cap}`);
            });
          }
        }
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
