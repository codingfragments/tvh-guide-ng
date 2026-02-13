/**
 * Auth login command - Interactive login and configuration
 */

import { Command } from 'commander';
import { prompt, promptPassword } from '../../utils/prompts.js';
import { success, handleError } from '../../utils/errors.js';
import { TVHeadendClient } from '@tvh-guide/tvheadend-client';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export function createLoginCommand(): Command {
  return new Command('login')
    .description('Interactive login - save credentials to configuration file')
    .action(async () => {
      try {
        console.log('TVHeadend CLI - Interactive Login\n');

        // Prompt for server details
        const url = await prompt('Server URL (e.g., http://localhost:9981): ');
        const username = await prompt('Username: ');
        const password = await promptPassword('Password: ');

        // Test connection
        console.log('\nTesting connection...');
        const client = new TVHeadendClient({
          baseUrl: url,
          username,
          password,
        });

        const serverInfo = await client.getServerInfo();

        success(`Connected to TVHeadend ${serverInfo.sw_version || 'server'}`);

        // Save configuration
        const configPath = path.join(os.homedir(), '.tvhrc');
        const config = {
          server: {
            url,
            username,
            password,
          },
          defaults: {
            format: 'table',
            limit: 50,
            color: true,
          },
        };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
        success(`Configuration saved to ${configPath}`);
      } catch (error) {
        handleError(error);
      }
    });
}
