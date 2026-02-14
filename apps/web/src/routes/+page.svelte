<script lang="ts">
  import {
    ClipboardCheck as ClipboardCheckIcon,
    Calendar as CalendarIcon,
    Tv as TvIcon,
    Video as VideoIcon,
    Search as SearchIcon,
  } from 'lucide-svelte';
</script>

<svelte:head>
  <title>TVH Guide</title>
</svelte:head>

<!-- Hero -->
<div class="hero min-h-[40vh]">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold">TVH Guide</h1>
      <p class="py-6">
        Electronic Program Guide for TVHeadend. Browse channels, view schedules, and manage recordings.
      </p>
      <a href="/plan" class="btn btn-primary">View Project Plan</a>
    </div>
  </div>
</div>

<!-- Feature cards -->
<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <a href="/plan" class="card bg-base-200 shadow-md transition-shadow hover:shadow-lg">
    <div class="card-body">
      <h2 class="card-title">
        <ClipboardCheckIcon class="size-6" />
        Project Plan
      </h2>
      <p>Roadmap, feature status, and system health.</p>
    </div>
  </a>

  <div class="card bg-base-200 shadow-md opacity-60">
    <div class="card-body">
      <h2 class="card-title">
        <CalendarIcon class="size-6" />
        EPG Browser
      </h2>
      <p>Browse the electronic program guide. <span class="badge badge-ghost badge-sm">Planned</span></p>
    </div>
  </div>

  <div class="card bg-base-200 shadow-md opacity-60">
    <div class="card-body">
      <h2 class="card-title">
        <TvIcon class="size-6" />
        Channels
      </h2>
      <p>Channel list and favorites. <span class="badge badge-ghost badge-sm">Planned</span></p>
    </div>
  </div>

  <div class="card bg-base-200 shadow-md opacity-60">
    <div class="card-body">
      <h2 class="card-title">
        <VideoIcon class="size-6" />
        Recordings
      </h2>
      <p>Manage DVR recordings. <span class="badge badge-ghost badge-sm">Planned</span></p>
    </div>
  </div>

  <div class="card bg-base-200 shadow-md opacity-60">
    <div class="card-body">
      <h2 class="card-title">
        <SearchIcon class="size-6" />
        Search
      </h2>
      <p>Fuzzy search across programs. <span class="badge badge-ghost badge-sm">Planned</span></p>
    </div>
  </div>
</div>
