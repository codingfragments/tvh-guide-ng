/**
 * DVR commands - Recording management
 */

import { Command } from 'commander';
import { createListCommand } from './list.js';
import { createScheduleCommand } from './schedule.js';
import { createCancelCommand } from './cancel.js';
import { createStopCommand } from './stop.js';
import { createRemoveCommand } from './remove.js';

/**
 * Create the dvr command group
 */
export function createDvrCommand(): Command {
  const dvr = new Command('dvr').description('Recording management');

  dvr.addCommand(createListCommand());
  dvr.addCommand(createScheduleCommand());
  dvr.addCommand(createCancelCommand());
  dvr.addCommand(createStopCommand());
  dvr.addCommand(createRemoveCommand());

  return dvr;
}
