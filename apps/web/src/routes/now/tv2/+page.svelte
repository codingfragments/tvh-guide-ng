<script lang="ts">
  import { env } from '$env/dynamic/public';

  const CHANNEL = '3';

  const streamUrl = $derived(buildStreamUrl(CHANNEL));

  function buildStreamUrl(channel: string): string {
    const path = `/hlsstream/${encodeURIComponent(channel)}/index.m3u8`;
    const base = normalizePublicBaseUrl(env.PUBLIC_HLS_PROXY_BASE_URL);
    if (!base) return path;
    return `${base.replace(/\/$/, '')}${path}`;
  }

  function normalizePublicBaseUrl(rawValue: string): string {
    const value = rawValue.trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith('//')) return value;
    return `http://${value}`;
  }
</script>

<svelte:head>
  <title>Live TV HLS Test (Channel 3) — TVH Guide</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-4 py-6">
  <h1 class="text-2xl font-bold">Live TV HLS Test</h1>
  <p class="text-sm text-base-content/70">Channel: <code>{CHANNEL}</code></p>
  <p class="text-xs text-base-content/60 break-all">URL: {streamUrl}</p>

  <div class="rounded-xl border border-base-300 bg-base-100 p-3 shadow-sm">
    <video
      src={streamUrl}
      controls
      playsinline
      webkit-playsinline
      preload="metadata"
      class="w-full rounded-lg bg-black"
    ></video>
  </div>
</div>
