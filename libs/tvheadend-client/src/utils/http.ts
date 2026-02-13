/**
 * HTTP utilities for TVHeadend API communication
 */

import fetch, { type RequestInit, type Response } from 'node-fetch';
import {
  TVHeadendError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BadRequestError,
  NetworkError,
} from './errors.js';

/**
 * Makes an HTTP request and handles errors
 * @param url - Full URL to request
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws {TVHeadendError} On HTTP errors or network failures
 */
export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    throw new NetworkError(
      `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined,
    );
  }

  // Handle HTTP errors
  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');

    switch (response.status) {
      case 400:
        throw new BadRequestError(errorText || 'Bad request');
      case 401:
        throw new AuthenticationError(errorText || 'Authentication failed');
      case 403:
        throw new AuthorizationError(errorText || 'Permission denied');
      case 404:
        throw new NotFoundError(errorText || 'Resource not found');
      default:
        throw new TVHeadendError(
          `HTTP ${response.status}: ${errorText || response.statusText}`,
          response.status,
        );
    }
  }

  // Parse JSON response
  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new TVHeadendError(
      `Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Builds a URL with query parameters
 * @param baseUrl - Base URL
 * @param path - API path
 * @param params - Query parameters (undefined values are omitted)
 * @returns Full URL with query string
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): string {
  const url = new URL(path, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Serializes complex filter parameters for TVHeadend API
 * @param filter - Filter value (string, object, or array)
 * @returns Serialized filter string
 */
export function serializeFilter(
  filter: string | Record<string, unknown> | Array<Record<string, unknown>>,
): string {
  if (typeof filter === 'string') {
    return filter;
  }
  return JSON.stringify(filter);
}
