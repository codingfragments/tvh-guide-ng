<script lang="ts">
  import SearchField from './SearchField.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import { Tv as TvIcon } from 'lucide-svelte';
</script>

<div class="navbar bg-base-200 shrink-0">
  <!-- Brand (mobile only — desktop shows brand in sidebar) -->
  <div class="flex-1 lg:hidden">
    <a href="/now" class="btn btn-ghost gap-2 text-xl">
      <TvIcon class="size-5" />
      TVH Guide
    </a>
  </div>

  <!-- Spacer on desktop (brand is in sidebar) -->
  <div class="hidden lg:flex flex-1"></div>

  <div class="flex items-center gap-1">
    <SearchField />
    <ThemeToggle />
  </div>
</div>
