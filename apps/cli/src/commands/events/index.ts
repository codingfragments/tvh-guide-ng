/**
 * Events commands - EPG event browsing and searching
 */

import { Command } from 'commander';
import { createListCommand } from './list.js';
import { createSearchCommand } from './search.js';
import { createShowCommand } from './show.js';
import { createGenresCommand } from './genres.js';

/**
 * Create the events command group
 */
export function createEventsCommand(): Command {
  const events = new Command('events').description('EPG event browsing and searching');

  events.addCommand(createListCommand());
  events.addCommand(createSearchCommand());
  events.addCommand(createShowCommand());
  events.addCommand(createGenresCommand());

  return events;
}
