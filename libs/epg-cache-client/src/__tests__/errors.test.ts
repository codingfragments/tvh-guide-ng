import { describe, it, expect } from 'vitest';
import { EpgCacheError, BadRequestError, NotFoundError, ConflictError, NetworkError } from '../errors.js';

describe('EpgCacheError', () => {
  it('creates an error with message and status code', () => {
    const error = new EpgCacheError('Something failed', 500);
    expect(error.message).toBe('Something failed');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('EpgCacheError');
    expect(error).toBeInstanceOf(Error);
  });

  it('creates an error without status code', () => {
    const error = new EpgCacheError('Parse error');
    expect(error.message).toBe('Parse error');
    expect(error.statusCode).toBeUndefined();
  });
});

describe('BadRequestError', () => {
  it('defaults to status 400 and default message', () => {
    const error = new BadRequestError();
    expect(error.message).toBe('Bad request');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('BadRequestError');
    expect(error).toBeInstanceOf(EpgCacheError);
  });

  it('accepts a custom message', () => {
    const error = new BadRequestError('Missing "q" parameter');
    expect(error.message).toBe('Missing "q" parameter');
    expect(error.statusCode).toBe(400);
  });
});

describe('NotFoundError', () => {
  it('defaults to status 404 and default message', () => {
    const error = new NotFoundError();
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('NotFoundError');
    expect(error).toBeInstanceOf(EpgCacheError);
  });

  it('accepts a custom message', () => {
    const error = new NotFoundError('Event not found');
    expect(error.message).toBe('Event not found');
  });
});

describe('ConflictError', () => {
  it('defaults to status 409 and default message', () => {
    const error = new ConflictError();
    expect(error.message).toBe('Conflict');
    expect(error.statusCode).toBe(409);
    expect(error.name).toBe('ConflictError');
    expect(error).toBeInstanceOf(EpgCacheError);
  });

  it('accepts a custom message', () => {
    const error = new ConflictError('Refresh already in progress');
    expect(error.message).toBe('Refresh already in progress');
  });
});

describe('NetworkError', () => {
  it('creates error with message', () => {
    const error = new NetworkError('Connection refused');
    expect(error.message).toBe('Connection refused');
    expect(error.name).toBe('NetworkError');
    expect(error.statusCode).toBeUndefined();
    expect(error.cause).toBeUndefined();
    expect(error).toBeInstanceOf(EpgCacheError);
  });

  it('creates error with cause', () => {
    const cause = new TypeError('fetch failed');
    const error = new NetworkError('Network request failed: fetch failed', cause);
    expect(error.cause).toBe(cause);
  });
});
