/**
 * Server commands - Server information and status
 */

import { Command } from 'commander';
import { createInfoCommand } from './info.js';
import { createConnectionsCommand } from './connections.js';

/**
 * Create the server command group
 */
export function createServerCommand(): Command {
  const server = new Command('server').description('Server information and status');

  server.addCommand(createInfoCommand());
  server.addCommand(createConnectionsCommand());

  return server;
}
