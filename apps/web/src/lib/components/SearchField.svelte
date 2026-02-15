<script lang="ts">
  import { Search as SearchIcon, X as XIcon } from 'lucide-svelte';

  let query = $state('');
  let mobileOpen = $state(false);
  let mobileInput: HTMLInputElement | undefined = $state();

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    // TODO: implement search navigation
  }

  function closeMobile() {
    mobileOpen = false;
    query = '';
  }

  $effect(() => {
    if (mobileOpen && mobileInput) {
      mobileInput.focus();
    }
  });
</script>

<!-- Desktop/tablet: inline search field (md+) -->
<form onsubmit={handleSubmit} class="hidden md:flex items-center">
  <label class="input input-bordered input-sm flex items-center gap-2 w-64">
    <SearchIcon class="size-4 opacity-50" />
    <input
      type="search"
      placeholder="Search programs…"
      class="grow"
      bind:value={query}
    />
  </label>
</form>

<!-- Mobile: icon button that opens an overlay -->
<button
  class="btn btn-ghost btn-circle md:hidden"
  aria-label="Open search"
  onclick={() => (mobileOpen = true)}
>
  <SearchIcon class="size-5" />
</button>

{#if mobileOpen}
  <!-- Mobile search overlay -->
  <div class="fixed inset-0 z-50 flex items-start bg-base-100 p-4 safe-pt md:hidden">
    <form onsubmit={handleSubmit} class="flex w-full items-center gap-2">
      <label class="input input-bordered flex items-center gap-2 flex-1">
        <SearchIcon class="size-4 opacity-50" />
        <input
          type="search"
          placeholder="Search programs…"
          class="grow"
          bind:value={query}
          bind:this={mobileInput}
        />
      </label>
      <button type="button" class="btn btn-ghost btn-circle" aria-label="Close search" onclick={closeMobile}>
        <XIcon class="size-5" />
      </button>
    </form>
  </div>
{/if}
