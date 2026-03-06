import type { RequestHandler } from './$types';
import {
  ChannelServiceConfigError,
  ChannelServiceResolutionError,
  createTvheadendAuthHeader,
  createTvheadendClient,
  getTvheadendBaseUrl,
  resolveChannelStream,
} from '$lib/server/channel-service';

export const GET: RequestHandler = async ({ params, request, url }) => {
  const profile = url.searchParams.get('profile');

  let resolvedPath: string;
  try {
    const client = createTvheadendClient();
    const resolved = await resolveChannelStream(client, params.channel, { profile });
    resolvedPath = resolved.streamPath;
  } catch (error) {
    if (error instanceof ChannelServiceResolutionError) {
      return new Response(error.message, { status: 404 });
    }
    if (error instanceof ChannelServiceConfigError) {
      return new Response(error.message, { status: 500 });
    }
    return new Response('Could not resolve channel stream', { status: 500 });
  }

  const upstreamUrl = `${getTvheadendBaseUrl()}${resolvedPath}`;
  const upstream = await fetch(upstreamUrl, {
    method: 'GET',
    headers: {
      Authorization: createTvheadendAuthHeader(),
      ...(request.headers.get('range') ? { Range: request.headers.get('range') as string } : {}),
      ...(request.headers.get('if-none-match') ? { 'If-None-Match': request.headers.get('if-none-match') as string } : {}),
      ...(request.headers.get('if-modified-since')
        ? { 'If-Modified-Since': request.headers.get('if-modified-since') as string }
        : {}),
    },
  });

  const headers = new Headers();
  const passthrough = [
    'content-type',
    'content-length',
    'accept-ranges',
    'content-range',
    'cache-control',
    'etag',
    'last-modified',
  ];

  for (const name of passthrough) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  if (!headers.has('cache-control')) {
    headers.set('cache-control', 'no-store');
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers,
  });
};
