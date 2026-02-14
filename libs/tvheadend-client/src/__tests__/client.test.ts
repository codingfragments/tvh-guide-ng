/**
 * Tests for TVHeadendClient initialization and configuration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TVHeadendClient } from '../client.js';
import {
  TVHeadendError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BadRequestError,
  NetworkError,
} from '../utils/errors.js';

describe('TVHeadendClient', () => {
  let client: TVHeadendClient;

  beforeEach(() => {
    client = new TVHeadendClient({
      baseUrl: 'http://localhost:9981',
      username: 'admin',
      password: 'secret',
    });
  });

  describe('constructor', () => {
    it('should create client with valid configuration', () => {
      expect(client).toBeInstanceOf(TVHeadendClient);
    });

    it('should strip trailing slash from baseUrl', () => {
      const clientWithSlash = new TVHeadendClient({
        baseUrl: 'http://localhost:9981/',
        username: 'admin',
        password: 'secret',
      });
      expect(clientWithSlash).toBeInstanceOf(TVHeadendClient);
    });

    it('should accept timeout option', () => {
      const clientWithTimeout = new TVHeadendClient({
        baseUrl: 'http://localhost:9981',
        username: 'admin',
        password: 'secret',
        timeout: 5000,
      });
      expect(clientWithTimeout).toBeInstanceOf(TVHeadendClient);
    });
  });

  describe('error classes', () => {
    it('should expose TVHeadendError', () => {
      const error = new TVHeadendError('Test error', 500);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(TVHeadendError);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('TVHeadendError');
    });

    it('should expose AuthenticationError', () => {
      const error = new AuthenticationError();
      expect(error).toBeInstanceOf(TVHeadendError);
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should expose AuthorizationError', () => {
      const error = new AuthorizationError();
      expect(error).toBeInstanceOf(TVHeadendError);
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('AuthorizationError');
    });

    it('should expose NotFoundError', () => {
      const error = new NotFoundError();
      expect(error).toBeInstanceOf(TVHeadendError);
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });

    it('should expose BadRequestError', () => {
      const error = new BadRequestError();
      expect(error).toBeInstanceOf(TVHeadendError);
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe('BadRequestError');
    });

    it('should expose NetworkError', () => {
      const cause = new Error('Connection refused');
      const error = new NetworkError('Network failed', cause);
      expect(error).toBeInstanceOf(TVHeadendError);
      expect(error.cause).toBe(cause);
      expect(error.name).toBe('NetworkError');
    });
  });
});
