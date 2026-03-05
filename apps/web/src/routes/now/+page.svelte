<script lang="ts">
  import { Tv as TvIcon, Radio as RadioIcon } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Now Showing — TVH Guide</title>
</svelte:head>

<div class="mx-auto max-w-3xl py-8">
  <div class="card bg-base-200 shadow-sm">
    <div class="card-body items-center gap-4 text-center">
      <TvIcon class="size-12 text-primary/60" />
      <h1 class="text-2xl font-bold">Now Showing</h1>
      <p class="text-base-content/70">
        Live channel playback is available as an experimental view.
      </p>
      <a href="/now/tv" class="btn btn-primary gap-2">
        <RadioIcon class="size-4" />
        Open Experimental TV View
      </a>
    </div>
  </div>
</div>
