<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ThemeToggle from './ThemeToggle.svelte';

  const { Story } = defineMeta({
    title: 'Components/ThemeToggle',
    component: ThemeToggle,
    globals: {
      viewport: { value: undefined, isRotated: false },
    },
  });
</script>

<Story name="Default" />

<Story name="Dark Theme (Macchiato)">
  {#snippet children()}
    <div data-theme="macchiato" class="bg-base-100 p-4">
      <ThemeToggle />
    </div>
  {/snippet}
</Story>

<Story name="Light Theme (Latte)">
  {#snippet children()}
    <div data-theme="latte" class="bg-base-100 p-4">
      <ThemeToggle />
    </div>
  {/snippet}
</Story>

<Story name="In Navbar Context">
  {#snippet children()}
    <div class="navbar bg-base-200">
      <div class="flex-1"></div>
      <div class="flex items-center gap-1">
        <ThemeToggle />
      </div>
    </div>
  {/snippet}
</Story>
