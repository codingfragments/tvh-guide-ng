<script lang="ts">
  import { Tv as TvIcon } from 'lucide-svelte';
  import LiveChannelPlayer from '$lib/components/live/LiveChannelPlayer.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let channelInput = $state('1');
  let profileInput = $state('');
  let profileInitialized = $state(false);

  $effect(() => {
    if (profileInitialized) return;
    profileInput = data.defaultProfile;
    profileInitialized = true;
  });
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
    <div class="card-body grid gap-3 md:grid-cols-2">
      <label class="form-control">
        <span class="label-text text-sm">Channel (number or UUID)</span>
        <input class="input input-bordered" bind:value={channelInput} placeholder="1" />
      </label>

      <label class="form-control">
        <span class="label-text text-sm">Profile (optional)</span>
        <select class="select select-bordered" bind:value={profileInput}>
          {#if data.profiles.length === 0}
            <option value="" disabled>No profiles available</option>
          {/if}
          {#each data.profiles as profile (profile.name)}
            <option value={profile.name}>
              {profile.label}
              {#if profile.name === data.configuredDefaultProfile}
                (Configured default)
              {/if}
            </option>
          {/each}
        </select>
      </label>
    </div>
  </div>

  {#if data.profilesError}
    <div class="alert alert-warning">
      <span>{data.profilesError}</span>
    </div>
  {/if}

  <LiveChannelPlayer
    channel={channelInput}
    profile={profileInput || undefined}
    controls={true}
    muted={true}
  />
</div>
