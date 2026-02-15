<script lang="ts">
  import { Settings as SettingsIcon } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Settings — TVH Guide</title>
</svelte:head>

<div class="flex flex-col items-center justify-center gap-4 py-12 text-center">
  <SettingsIcon class="size-16 text-primary opacity-30" />
  <h1 class="text-2xl font-bold">Settings</h1>
  <p class="text-base-content/60">Application settings will appear here.</p>

  <a href="/plan" class="btn btn-outline btn-sm mt-4">View Project Plan</a>
</div>
