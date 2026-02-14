/**
 * Output formatting utilities
 */

import chalk from 'chalk';
import Table from 'cli-table3';

export interface ColumnDefinition<T> {
  key: keyof T;
  label: string;
  width?: number;
  format?: (value: unknown) => string;
}

/**
 * Format data as a table
 */
export function formatTable<T extends Record<string, unknown>>(
  data: T[],
  columns: ColumnDefinition<T>[],
  useColor = true,
): string {
  const table = new Table({
    head: columns.map((col) => (useColor ? chalk.cyan(col.label) : col.label)),
    colWidths: columns.map((col) => col.width || null),
    style: {
      head: [],
      border: useColor ? ['grey'] : [],
    },
  });

  data.forEach((item) => {
    const row = columns.map((col) => {
      const value = item[col.key];
      if (col.format) {
        return col.format(value);
      }
      if (value === null || value === undefined) {
        return '';
      }
      return String(value);
    });
    table.push(row);
  });

  return table.toString();
}

/**
 * Format data as JSON
 */
export function formatJSON(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Format output based on format type
 */
export function formatOutput<T extends Record<string, unknown>>(
  data: T | T[],
  format: 'table' | 'json',
  columns?: ColumnDefinition<T>[],
  useColor = true,
): string {
  if (format === 'json') {
    return formatJSON(data);
  }

  if (Array.isArray(data) && columns) {
    return formatTable(data, columns, useColor);
  }

  // Fallback to JSON for single objects without column definitions
  return formatJSON(data);
}

/**
 * Format a boolean value for display
 */
export function formatBoolean(value: boolean, useColor = true): string {
  if (useColor) {
    return value ? chalk.green('Yes') : chalk.red('No');
  }
  return value ? 'Yes' : 'No';
}

/**
 * Format a date/time value for display
 */
export function formatDateTime(timestamp: number | string): string {
  const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
  return date.toLocaleString();
}

/**
 * Truncate a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}
