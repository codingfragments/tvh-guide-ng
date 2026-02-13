/**
 * Channels show command - Show detailed channel information
 */

import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { createClient, getConfig } from '../../utils/client.js';
import { formatJSON, formatBoolean } from '../../utils/output.js';
import { handleError } from '../../utils/errors.js';

export function createShowCommand(): Command {
  return new Command('show')
    .description('Show detailed channel information')
    .argument('<id>', 'Channel UUID or number')
    .option('--format <type>', 'Output format: table, json', 'table')
    .action(async (id, options, command) => {
      const globalOpts = command.optsWithGlobals();
      const spinner = ora('Fetching channel information...').start();

      try {
        const client = createClient(globalOpts);
        const config = getConfig(globalOpts);

        // Fetch all channels to find the requested one
        const response = await client.getChannelGrid({
          limit: 999,
          start: 0,
        });

        // Try to find by UUID first, then by number
        let channel = response.entries.find((ch) => ch.uuid === id);
        if (!channel) {
          const channelNumber = parseInt(id);
          if (!isNaN(channelNumber)) {
            channel = response.entries.find((ch) => ch.number === channelNumber);
          }
        }

        spinner.stop();

        if (!channel) {
          console.log(chalk.red(`Channel not found: ${id}`));
          process.exit(1);
        }

        const format = globalOpts.format || options.format;

        if (format === 'json') {
          console.log(formatJSON(channel));
        } else {
          const useColor = config.defaults?.color !== false;

          console.log(chalk.bold('\n📺 Channel Information'));
          console.log(`  UUID:     ${channel.uuid}`);
          console.log(`  Number:   ${channel.number}`);
          console.log(`  Name:     ${channel.name}`);
          console.log(`  Enabled:  ${formatBoolean(channel.enabled || false, useColor)}`);

          if (channel.iconPublicUrl) {
            console.log(`  Icon:     ${channel.iconPublicUrl}`);
          }

          if (channel.services && channel.services.length > 0) {
            console.log(`  Services: ${channel.services.length} service(s)`);
          }

          if (channel.tags && channel.tags.length > 0) {
            console.log(`  Tags:     ${channel.tags.length} tag(s)`);
          }
        }
      } catch (error) {
        spinner.stop();
        handleError(error, globalOpts.verbose);
      }
    });
}
