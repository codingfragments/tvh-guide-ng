import {
  EpgCacheError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  ServiceUnavailableError,
  NetworkError,
} from './errors.js';

export interface RequestOptions {
  method?: string;
  timeout?: number;
  body?: string;
}

/**
 * Makes an HTTP request and maps errors to the EpgCacheError hierarchy.
 * Uses native fetch (stable in Node 24).
 */
export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', timeout, body } = options;

  const fetchOptions: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
    signal: timeout ? AbortSignal.timeout(timeout) : undefined,
    body,
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new NetworkError('Request timed out');
    }
    throw new NetworkError(
      `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined,
    );
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');

    switch (response.status) {
      case 400:
        throw new BadRequestError(errorBody || 'Bad request');
      case 404:
        throw new NotFoundError(errorBody || 'Resource not found');
      case 409:
        throw new ConflictError(errorBody || 'Conflict');
      case 503:
        throw new ServiceUnavailableError(errorBody || 'Service unavailable');
      default:
        throw new EpgCacheError(
          `HTTP ${String(response.status)}: ${errorBody || response.statusText}`,
          response.status,
        );
    }
  }

  // 202 Accepted and other success codes with JSON body
  try {
    return (await response.json()) as T;
  } catch (error) {
    throw new EpgCacheError(`Failed to parse response: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Makes an HTTP request expecting a binary response (e.g., image).
 * Returns the raw Response on success; throws on error.
 */
export async function requestBinary(url: string, options: RequestOptions = {}): Promise<Response> {
  const { method = 'GET', timeout } = options;

  const fetchOptions: RequestInit = {
    method,
    signal: timeout ? AbortSignal.timeout(timeout) : undefined,
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new NetworkError('Request timed out');
    }
    throw new NetworkError(
      `Network request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined,
    );
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');

    switch (response.status) {
      case 400:
        throw new BadRequestError(errorBody || 'Bad request');
      case 404:
        throw new NotFoundError(errorBody || 'Resource not found');
      case 409:
        throw new ConflictError(errorBody || 'Conflict');
      case 503:
        throw new ServiceUnavailableError(errorBody || 'Service unavailable');
      default:
        throw new EpgCacheError(
          `HTTP ${String(response.status)}: ${errorBody || response.statusText}`,
          response.status,
        );
    }
  }

  return response;
}

/**
 * Builds a URL with query parameters. Undefined values are omitted.
 */
export function buildUrl(baseUrl: string, path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(path, baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    }
  }

  return url.toString();
}
