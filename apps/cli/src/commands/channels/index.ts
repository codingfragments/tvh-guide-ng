/**
 * Channels commands - Channel browsing and management
 */

import { Command } from 'commander';
import { createListCommand } from './list.js';
import { createSearchCommand } from './search.js';
import { createTagsCommand } from './tags.js';
import { createShowCommand } from './show.js';

/**
 * Create the channels command group
 */
export function createChannelsCommand(): Command {
  const channels = new Command('channels').description('Channel browsing and management');

  channels.addCommand(createListCommand());
  channels.addCommand(createSearchCommand());
  channels.addCommand(createTagsCommand());
  channels.addCommand(createShowCommand());

  return channels;
}
