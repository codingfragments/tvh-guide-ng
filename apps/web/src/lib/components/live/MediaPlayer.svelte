<script lang="ts">
  let {
    src,
    autoplay = false,
    muted = true,
    controls = true,
    playsinline = true,
    poster,
    class: className = '',
    preload = 'metadata',
  }: {
    src: string;
    autoplay?: boolean;
    muted?: boolean;
    controls?: boolean;
    playsinline?: boolean;
    poster?: string;
    class?: string;
    preload?: 'none' | 'metadata' | 'auto';
  } = $props();
</script>

<video
  {src}
  {autoplay}
  {muted}
  {controls}
  {playsinline}
  {poster}
  {preload}
  class={`h-full w-full rounded-lg bg-black object-contain ${className}`}
>
  <track kind="captions" />
  Your browser does not support HTML5 video playback.
</video>
