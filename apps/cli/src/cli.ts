/**
 * TVHeadend CLI - Main entry point
 */

import { Command } from 'commander';
import { createAuthCommand } from './commands/auth/index.js';
import { createChannelsCommand } from './commands/channels/index.js';
import { createEventsCommand } from './commands/events/index.js';
import { createDvrCommand } from './commands/dvr/index.js';
import { createServerCommand } from './commands/server/index.js';

// Read package.json for version
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('tvh')
  .description('TVHeadend CLI - Manage EPG and recordings from the command line')
  .version(packageJson.version);

// Global options
program
  .option('--url <url>', 'TVHeadend server URL (overrides config)')
  .option('--username <user>', 'Username (overrides config)')
  .option('--password <pass>', 'Password (overrides config)')
  .option('--json', 'Output as JSON')
  .option('--format <type>', 'Output format: table, json')
  .option('--quiet', 'Minimal output (no spinners, colors)')
  .option('--verbose', 'Detailed output with debug info')
  .option('--no-color', 'Disable colors');

// Register command groups
program.addCommand(createAuthCommand());
program.addCommand(createChannelsCommand());
program.addCommand(createEventsCommand());
program.addCommand(createDvrCommand());
program.addCommand(createServerCommand());

// Parse arguments
program.parse();
