/** Base error class for EPG Cache client errors */
export class EpgCacheError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'EpgCacheError';
    // captureStackTrace is V8-specific; optional chain is intentional for portability
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/** Bad request error (400) */
export class BadRequestError extends EpgCacheError {
  constructor(message = 'Bad request') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

/** Resource not found error (404) */
export class NotFoundError extends EpgCacheError {
  constructor(message = 'Resource not found') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/** Conflict error (409) — e.g., refresh already in progress */
export class ConflictError extends EpgCacheError {
  constructor(message = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/** Network or connection error */
export class NetworkError extends EpgCacheError {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}
