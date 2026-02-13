/**
 * Interactive prompt utilities
 */

import * as readline from 'readline';

/**
 * Prompt for user input
 */
export function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Prompt for password input (hidden)
 */
export function promptPassword(question: string): Promise<string> {
  return new Promise((resolve) => {
    // Disable echoing for password input
    const stdin = process.stdin as any;
    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }

    process.stdout.write(question);

    let password = '';
    const onData = (char: Buffer) => {
      const c = char.toString('utf8');

      switch (c) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          if (stdin.setRawMode) {
            stdin.setRawMode(false);
          }
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          if (stdin.setRawMode) {
            stdin.setRawMode(false);
          }
          process.stdin.removeListener('data', onData);
          process.exit(1);
        case '\b': // Backspace
        case '\u007f': // Delete
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += c;
          process.stdout.write('*');
      }
    };

    process.stdin.on('data', onData);
  });
}

/**
 * Prompt for confirmation (yes/no)
 */
export async function confirm(question: string, defaultValue = false): Promise<boolean> {
  const defaultText = defaultValue ? '[Y/n]' : '[y/N]';
  const answer = await prompt(`${question} ${defaultText}: `);

  if (answer === '') {
    return defaultValue;
  }

  return answer.toLowerCase().startsWith('y');
}
