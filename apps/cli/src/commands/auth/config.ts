/**
 * Auth config command - Show configuration file location
 */

import { Command } from 'commander';
import { getConfigPath } from '../../utils/config.js';
import { info } from '../../utils/errors.js';
import chalk from 'chalk';

export function createConfigCommand(): Command {
  return new Command('config')
    .description('Show configuration file location and contents')
    .action(() => {
      const configPath = getConfigPath();

      if (configPath) {
        console.log(chalk.bold('📄 Configuration File'));
        console.log(`  Location: ${configPath}`);
        info('Configuration loaded successfully');
      } else {
        console.log(chalk.yellow('⚠️  No configuration file found'));
        console.log('\nYou can create a configuration file in one of these locations:');
        console.log('  • ~/.tvhrc');
        console.log('  • .tvhrc (in current directory)');
        console.log('  • tvh.config.js');
        console.log('  • package.json ("tvh" field)');
        console.log('\nOr use the interactive setup:');
        console.log(chalk.cyan('  tvh auth login'));
      }
    });
}
