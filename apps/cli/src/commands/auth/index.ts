/**
 * Auth commands - Authentication and configuration management
 */

import { Command } from 'commander';
import { createLoginCommand } from './login.js';
import { createStatusCommand } from './status.js';
import { createConfigCommand } from './config.js';

/**
 * Create the auth command group
 */
export function createAuthCommand(): Command {
  const auth = new Command('auth').description(
    'Authentication and configuration management'
  );

  auth.addCommand(createLoginCommand());
  auth.addCommand(createStatusCommand());
  auth.addCommand(createConfigCommand());

  return auth;
}
