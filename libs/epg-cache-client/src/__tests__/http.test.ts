import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { request, buildUrl } from '../http.js';
import { BadRequestError, NotFoundError, ConflictError, EpgCacheError, NetworkError } from '../errors.js';

function mockFetchResponse(body: unknown, status = 200, statusText = 'OK'): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    headers: new Headers(),
  } as Response;
}

describe('request', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('makes a GET request and returns parsed JSON', async () => {
    const data = { status: 'healthy' };
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(data));

    const result = await request<typeof data>('http://localhost:3000/api/health');
    expect(result).toEqual(data);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/health', expect.objectContaining({
      method: 'GET',
    }));
  });

  it('makes a POST request', async () => {
    const data = { message: 'Refresh started' };
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(data, 202));

    const result = await request<typeof data>('http://localhost:3000/api/cache/refresh', {
      method: 'POST',
    });
    expect(result).toEqual(data);
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/cache/refresh', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('passes timeout via AbortSignal', async () => {
    const data = { status: 'healthy' };
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(data));

    await request('http://localhost:3000/api/health', { timeout: 5000 });

    const callArgs = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(callArgs.signal).toBeDefined();
  });

  it('throws BadRequestError on 400', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(
      { error: 'Query parameter "q" is required' },
      400,
      'Bad Request',
    ));

    await expect(request('http://localhost:3000/api/events/search'))
      .rejects.toThrow(BadRequestError);
  });

  it('throws NotFoundError on 404', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(
      { error: 'Event not found' },
      404,
      'Not Found',
    ));

    await expect(request('http://localhost:3000/api/events/999'))
      .rejects.toThrow(NotFoundError);
  });

  it('throws ConflictError on 409', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(
      { error: 'Refresh already in progress' },
      409,
      'Conflict',
    ));

    await expect(request('http://localhost:3000/api/cache/refresh', { method: 'POST' }))
      .rejects.toThrow(ConflictError);
  });

  it('throws EpgCacheError on other HTTP errors', async () => {
    vi.mocked(fetch).mockResolvedValue(mockFetchResponse(
      'Internal Server Error',
      500,
      'Internal Server Error',
    ));

    await expect(request('http://localhost:3000/api/health'))
      .rejects.toThrow(EpgCacheError);
  });

  it('throws NetworkError when fetch rejects', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('fetch failed'));

    await expect(request('http://localhost:3000/api/health'))
      .rejects.toThrow(NetworkError);
  });

  it('throws NetworkError on timeout', async () => {
    const timeoutError = new DOMException('The operation was aborted.', 'TimeoutError');
    vi.mocked(fetch).mockRejectedValue(timeoutError);

    await expect(request('http://localhost:3000/api/health', { timeout: 100 }))
      .rejects.toThrow(NetworkError);
    await expect(request('http://localhost:3000/api/health', { timeout: 100 }))
      .rejects.toThrow('Request timed out');
  });

  it('throws EpgCacheError on invalid JSON response', async () => {
    const badResponse = {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
      text: () => Promise.resolve('not json'),
      headers: new Headers(),
    } as unknown as Response;
    vi.mocked(fetch).mockResolvedValue(badResponse);

    await expect(request('http://localhost:3000/api/health'))
      .rejects.toThrow(EpgCacheError);
    await expect(request('http://localhost:3000/api/health'))
      .rejects.toThrow('Failed to parse response');
  });
});

describe('buildUrl', () => {
  it('builds a URL from base and path', () => {
    expect(buildUrl('http://localhost:3000', '/api/health')).toBe('http://localhost:3000/api/health');
  });

  it('appends query parameters', () => {
    const url = buildUrl('http://localhost:3000', '/api/events/search', {
      q: 'Tagesschau',
      limit: 10,
    });
    expect(url).toBe('http://localhost:3000/api/events/search?q=Tagesschau&limit=10');
  });

  it('omits undefined parameters', () => {
    const url = buildUrl('http://localhost:3000', '/api/events/search', {
      q: 'test',
      channel: undefined,
      limit: 20,
    });
    expect(url).toBe('http://localhost:3000/api/events/search?q=test&limit=20');
  });

  it('handles empty params object', () => {
    const url = buildUrl('http://localhost:3000', '/api/health', {});
    expect(url).toBe('http://localhost:3000/api/health');
  });

  it('handles no params', () => {
    const url = buildUrl('http://localhost:3000', '/api/health');
    expect(url).toBe('http://localhost:3000/api/health');
  });
});
