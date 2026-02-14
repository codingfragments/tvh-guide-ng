/**
 * Custom error classes for TVHeadend API client
 */

/**
 * Base error class for TVHeadend API errors
 */
export class TVHeadendError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'TVHeadendError';
    // captureStackTrace is V8-specific; optional chain is intentional for portability
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Authentication failed error (401)
 */
export class AuthenticationError extends TVHeadendError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization/permission denied error (403)
 */
export class AuthorizationError extends TVHeadendError {
  constructor(message = 'Permission denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends TVHeadendError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Bad request error (400)
 */
export class BadRequestError extends TVHeadendError {
  constructor(message = 'Bad request') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

/**
 * Network or connection error
 */
export class NetworkError extends TVHeadendError {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}
