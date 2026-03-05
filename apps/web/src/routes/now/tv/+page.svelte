<script lang="ts">
  import { Tv as TvIcon } from 'lucide-svelte';
  import LiveChannelPlayer from '$lib/components/live/LiveChannelPlayer.svelte';

  let channelInput = $state('1');
  let profileInput = $state('');
  let transportInput = $state('');
</script>

<svelte:head>
  <title>Live TV (Experimental) — TVH Guide</title>
</svelte:head>

<div class="mx-auto max-w-5xl space-y-6 py-6">
  <div class="space-y-2 text-center">
    <TvIcon class="mx-auto size-12 text-primary/60" />
    <h1 class="text-2xl font-bold">Live TV (Experimental)</h1>
    <p class="text-base-content/60">Server-resolved TVHeadend stream playback by channel.</p>
  </div>

  <div class="card bg-base-200 shadow-sm">
    <div class="card-body grid gap-3 md:grid-cols-3">
      <label class="form-control">
        <span class="label-text text-sm">Channel (number or UUID)</span>
        <input class="input input-bordered" bind:value={channelInput} placeholder="1" />
      </label>

      <label class="form-control">
        <span class="label-text text-sm">Profile (optional)</span>
        <input class="input input-bordered" bind:value={profileInput} placeholder="webtv-h264-aac-matroska" />
      </label>

      <label class="form-control">
        <span class="label-text text-sm">Transport (optional)</span>
        <input class="input input-bordered" bind:value={transportInput} placeholder="hls" />
      </label>
    </div>
  </div>

  <LiveChannelPlayer
    channel={channelInput}
    profile={profileInput || undefined}
    transport={transportInput || undefined}
    controls={true}
    muted={true}
    autoplay={true}
  />
</div>
