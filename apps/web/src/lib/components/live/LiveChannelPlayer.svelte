<script lang="ts">
  import { LoaderCircle as LoaderCircleIcon, TriangleAlert as TriangleAlertIcon, Tv as TvIcon } from 'lucide-svelte';
  import MediaPlayer from './MediaPlayer.svelte';
  import {
    defaultLiveStreamUrlResolver,
    type LiveStreamUrlPayload,
    type LiveStreamResolveOptions,
    type LiveStreamUrlResolver,
  } from './live-stream-client';

  let {
    channel,
    profile,
    transport,
    autoplay = true,
    autoplayDelay = 2,
    muted = true,
    controls = true,
    class: className = '',
    resolver = defaultLiveStreamUrlResolver,
  }: {
    channel?: string;
    profile?: string;
    transport?: string;
    autoplay?: boolean;
    autoplayDelay?: number;
    muted?: boolean;
    controls?: boolean;
    class?: string;
    resolver?: LiveStreamUrlResolver;
  } = $props();

  let loading = $state(false);
  let stream = $state<LiveStreamUrlPayload | null>(null);
  let errorMessage = $state<string | null>(null);
  let mediaSrc = $state<string | null>(null);
  let activeRequest = 0;

  $effect(() => {
    const input = channel?.trim() ?? '';
    const options: LiveStreamResolveOptions = {
      channel: input,
      ...(profile ? { profile } : {}),
      ...(transport ? { transport } : {}),
    };

    if (!input) {
      stream = null;
      errorMessage = null;
      loading = false;
      return;
    }

    loading = true;
    errorMessage = null;

    const requestId = ++activeRequest;
    void resolver(options)
      .then((payload) => {
        if (requestId !== activeRequest) return;
        stream = payload;
      })
      .catch((error: unknown) => {
        if (requestId !== activeRequest) return;
        const message = error instanceof Error ? error.message : 'Could not load live stream URL';
        errorMessage = message;
        stream = null;
      })
      .finally(() => {
        if (requestId === activeRequest) {
          loading = false;
        }
      });
  });

  $effect(() => {
    const url = stream?.url;
    if (!url) {
      mediaSrc = null;
      return;
    }

    if (!autoplay) {
      mediaSrc = url;
      return;
    }

    mediaSrc = null;
    const delaySeconds = Number.isFinite(autoplayDelay) ? Math.max(0, autoplayDelay) : 0;
    const timeoutId = setTimeout(() => {
      mediaSrc = url;
    }, delaySeconds * 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  });
</script>

<div class={`card bg-base-200 shadow-sm ${className}`}>
  <div class="card-body gap-3">
    <div class="flex items-center gap-2 text-sm">
      <TvIcon class="size-4 text-primary" />
      <span class="font-medium">Live channel</span>
      {#if stream}
        <span class="text-base-content/60">· {stream.channel.name}</span>
      {/if}
    </div>

    {#if !channel?.trim()}
      <div class="rounded-lg border border-dashed border-base-300 bg-base-100 px-4 py-6 text-sm text-base-content/60">
        Set a `channel` prop to start playback.
      </div>
    {:else if loading}
      <div class="flex items-center gap-2 rounded-lg bg-base-100 px-4 py-6 text-sm">
        <LoaderCircleIcon class="size-4 animate-spin text-primary" />
        Resolving stream URL...
      </div>
    {:else if errorMessage}
      <div class="rounded-lg border border-error/30 bg-error/10 px-4 py-4 text-sm">
        <div class="mb-1 flex items-center gap-2 font-medium text-error">
          <TriangleAlertIcon class="size-4" />
          Stream unavailable
        </div>
        <p class="text-base-content/80">{errorMessage}</p>
      </div>
    {:else if stream}
      <div class="space-y-2">
        {#if mediaSrc}
          <MediaPlayer src={mediaSrc} {autoplay} {muted} {controls} />
        {:else}
          <div class="flex items-center gap-2 rounded-lg bg-base-100 px-4 py-6 text-sm">
            <LoaderCircleIcon class="size-4 animate-spin text-primary" />
            Starting playback...
          </div>
        {/if}
        <div class="text-xs text-base-content/60">
          <span>channel: {stream.channel.uuid}</span>
          {#if stream.profile}
            <span> · profile: {stream.profile}</span>
          {/if}
          {#if stream.transport}
            <span> · transport: {stream.transport}</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>
