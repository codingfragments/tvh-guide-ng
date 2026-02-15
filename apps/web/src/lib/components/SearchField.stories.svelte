<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SearchField from './SearchField.svelte';

  const { Story } = defineMeta({
    title: 'Components/SearchField',
    component: SearchField,
  });
</script>

<Story name="Desktop Inline" parameters={{ viewport: { defaultViewport: 'tablet' } }}>
  {#snippet children()}
    <div style="width: 600px;" class="p-4">
      <SearchField />
    </div>
  {/snippet}
</Story>

<Story name="Mobile Icon Button" parameters={{ viewport: { defaultViewport: 'mobile1' } }}>
  {#snippet children()}
    <div style="width: 375px;" class="p-4">
      <SearchField />
    </div>
  {/snippet}
</Story>

<Story name="Mobile Overlay" parameters={{ viewport: { defaultViewport: 'mobile1' } }}>
  {#snippet children()}
    <div style="width: 375px;" class="p-4">
      <p class="text-sm text-base-content/60 mb-2">Click the search icon to open the overlay</p>
      <SearchField />
    </div>
  {/snippet}
</Story>

<Story name="In Navbar Context">
  {#snippet children()}
    <div class="navbar bg-base-200">
      <div class="flex-1"></div>
      <div class="flex items-center gap-1">
        <SearchField />
      </div>
    </div>
  {/snippet}
</Story>
