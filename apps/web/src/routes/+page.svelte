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
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
        Project Plan
      </h2>
      <p>Roadmap, feature status, and system health.</p>
    </div>
  </a>

  <div class="card bg-base-200 shadow-md opacity-60">
    <div class="card-body">
      <h2 class="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        EPG Browser
      </h2>
      <p>Browse the electronic program guide. <span class="badge badge-ghost badge-sm">Planned</span></p>
    </div>
  </div>

  <div class="card bg-base-200 shadow-md opacity-60">
    <div class="card-body">
      <h2 class="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
          />
        </svg>
        Channels
      </h2>
      <p>Channel list and favorites. <span class="badge badge-ghost badge-sm">Planned</span></p>
    </div>
  </div>

  <div class="card bg-base-200 shadow-md opacity-60">
    <div class="card-body">
      <h2 class="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        Recordings
      </h2>
      <p>Manage DVR recordings. <span class="badge badge-ghost badge-sm">Planned</span></p>
    </div>
  </div>

  <div class="card bg-base-200 shadow-md opacity-60">
    <div class="card-body">
      <h2 class="card-title">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        Search
      </h2>
      <p>Fuzzy search across programs. <span class="badge badge-ghost badge-sm">Planned</span></p>
    </div>
  </div>
</div>
