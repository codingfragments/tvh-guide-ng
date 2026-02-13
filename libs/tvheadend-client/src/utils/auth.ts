/**
 * Authentication utilities for TVHeadend API
 */

/**
 * Creates a Basic Authentication header value
 * @param username - TVHeadend username
 * @param password - TVHeadend password
 * @returns Base64-encoded Basic auth header value
 */
export function createBasicAuthHeader(username: string, password: string): string {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${credentials}`;
}
