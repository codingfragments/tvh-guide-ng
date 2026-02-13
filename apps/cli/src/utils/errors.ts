/**
 * Error handling utilities
 */

import chalk from 'chalk';

/**
 * Handle and display errors in a user-friendly way
 */
export function handleError(error: unknown, verbose = false): never {
  if (error instanceof Error) {
    console.error(chalk.red('Error:'), error.message);

    if (verbose && error.stack) {
      console.error(chalk.grey('\nStack trace:'));
      console.error(chalk.grey(error.stack));
    }

    // Provide helpful hints for common errors
    if (error.message.includes('ECONNREFUSED')) {
      console.error(
        chalk.yellow('\nHint:'),
        'Could not connect to TVHeadend server. Check that:'
      );
      console.error('  1. The server URL is correct (use --url flag)');
      console.error('  2. TVHeadend is running');
      console.error('  3. The port is accessible');
    } else if (error.message.includes('401') || error.message.includes('authentication')) {
      console.error(
        chalk.yellow('\nHint:'),
        'Authentication failed. Check your username and password.'
      );
      console.error('  Use --username and --password flags or configure ~/.tvhrc');
    } else if (error.message.includes('Server URL is required')) {
      console.error(chalk.yellow('\nHint:'), 'You can configure the server in two ways:');
      console.error('  1. Use --url flag: tvh --url http://localhost:9981 <command>');
      console.error('  2. Create ~/.tvhrc with server configuration');
    }
  } else {
    console.error(chalk.red('Error:'), String(error));
  }

  process.exit(1);
}

/**
 * Display a warning message
 */
export function warn(message: string): void {
  console.warn(chalk.yellow('Warning:'), message);
}

/**
 * Display a success message
 */
export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Display an info message
 */
export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}
