import { env as publicEnv } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, request, fetch }) => {
  const epgBaseUrl = (publicEnv.PUBLIC_EPG_CACHE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const variant = url.searchParams.get('variant');
  const query = variant ? `?variant=${encodeURIComponent(variant)}` : '';
  const upstreamUrl = `${epgBaseUrl}/api/picon/srp/${encodeURIComponent(params.serviceRef)}${query}`;

  const upstream = await fetch(upstreamUrl, {
    method: 'GET',
    headers: {
      ...(request.headers.get('accept') ? { Accept: request.headers.get('accept') as string } : {}),
      ...(request.headers.get('if-none-match') ? { 'If-None-Match': request.headers.get('if-none-match') as string } : {}),
      ...(request.headers.get('if-modified-since')
        ? { 'If-Modified-Since': request.headers.get('if-modified-since') as string }
        : {}),
    },
  });

  const headers = new Headers();
  for (const name of ['content-type', 'content-length', 'cache-control', 'etag', 'last-modified']) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
};
