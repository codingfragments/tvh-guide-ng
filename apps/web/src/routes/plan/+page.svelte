<script lang="ts">
  let { data } = $props();
</script>

<svelte:head>
  <title>Project Plan - TVH Guide</title>
</svelte:head>

<div class="mx-auto max-w-4xl">
  <h1 class="mb-6 text-3xl font-bold">Project Plan</h1>

  <!-- Milestones -->
  <ul class="timeline timeline-vertical timeline-snap-icon">
    {#each data.milestones as milestone, i (milestone.title)}
      <li>
        {#if i > 0}
          <hr class={milestone.status === 'done' ? 'bg-primary' : ''} />
        {/if}
        <div class="timeline-middle">
          {#if milestone.status === 'done'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-5 w-5 text-primary"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
          {:else if milestone.status === 'in-progress'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-5 w-5 text-warning"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clip-rule="evenodd"
              />
            </svg>
          {:else}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              class="h-5 w-5 text-base-content/40"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clip-rule="evenodd"
              />
            </svg>
          {/if}
        </div>
        <div class={`timeline-box mb-8 ${i % 2 === 0 ? 'timeline-start md:text-end' : 'timeline-end'}`}>
          <h2 class="text-lg font-semibold">
            {milestone.title}
            {#if milestone.status === 'in-progress'}
              <span class="badge badge-warning badge-sm ml-2">In Progress</span>
            {:else if milestone.status === 'done'}
              <span class="badge badge-success badge-sm ml-2">Done</span>
            {:else}
              <span class="badge badge-ghost badge-sm ml-2">Planned</span>
            {/if}
          </h2>
          <ul class="mt-2 space-y-1">
            {#each milestone.features as feature (feature.name)}
              <li class="flex items-center gap-2" class:justify-end={i % 2 === 0}>
                {#if feature.status === 'done'}
                  <span class="badge badge-success badge-xs"></span>
                {:else if feature.status === 'in-progress'}
                  <span class="badge badge-warning badge-xs"></span>
                {:else}
                  <span class="badge badge-ghost badge-xs"></span>
                {/if}
                <span class="text-sm">{feature.name}</span>
              </li>
            {/each}
          </ul>
        </div>
        {#if i < data.milestones.length - 1}
          <hr class={milestone.status === 'done' ? 'bg-primary' : ''} />
        {/if}
      </li>
    {/each}
  </ul>

  <!-- Feature details table -->
  <h2 class="mb-4 mt-12 text-2xl font-bold">Feature Details</h2>
  <div class="overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>Feature</th>
          <th>Description</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {#each data.milestones as milestone (milestone.title)}
          {#each milestone.features as feature (feature.name)}
            <tr>
              <td class="font-medium">{feature.name}</td>
              <td>{feature.description}</td>
              <td>
                {#if feature.status === 'done'}
                  <span class="badge badge-success">Done</span>
                {:else if feature.status === 'in-progress'}
                  <span class="badge badge-warning">In Progress</span>
                {:else}
                  <span class="badge badge-ghost">Planned</span>
                {/if}
              </td>
            </tr>
          {/each}
        {/each}
      </tbody>
    </table>
  </div>

  <!-- System health placeholder -->
  <h2 class="mb-4 mt-12 text-2xl font-bold">System Health</h2>
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="card bg-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm">EPG Cache Service</h3>
        <div class="flex items-center gap-2">
          <span class="badge badge-ghost">Not connected</span>
          <span class="text-xs text-base-content/60">Will be wired up in a future milestone</span>
        </div>
      </div>
    </div>
    <div class="card bg-base-200">
      <div class="card-body">
        <h3 class="card-title text-sm">TVHeadend</h3>
        <div class="flex items-center gap-2">
          <span class="badge badge-ghost">Not connected</span>
          <span class="text-xs text-base-content/60">Will be wired up in a future milestone</span>
        </div>
      </div>
    </div>
  </div>
</div>
