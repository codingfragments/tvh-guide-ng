<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SearchField from './SearchField.svelte';

  const { Story } = defineMeta({
    title: 'Components/SearchField',
    component: SearchField,
  });
</script>

<Story name="Desktop Inline" globals={{ viewport: { value: 'tablet', isRotated: false } }}>
  {#snippet children()}
    <div style="width: 600px;" class="p-4">
      <SearchField />
    </div>
  {/snippet}
</Story>

<Story name="Mobile Icon Button" globals={{ viewport: { value: 'mobile1', isRotated: false } }}>
  {#snippet children()}
    <div style="width: 375px;" class="p-4">
      <SearchField />
    </div>
  {/snippet}
</Story>

<Story name="Mobile Overlay" globals={{ viewport: { value: 'mobile1', isRotated: false } }}>
  {#snippet children()}
    <div style="width: 375px;" class="p-4">
      <p class="text-sm text-base-content/60 mb-2">Click the search icon to open the overlay</p>
      <SearchField />
    </div>
  {/snippet}
</Story>

<Story name="In Navbar Context" globals={{ viewport: { value: undefined, isRotated: false } }}>
  {#snippet children()}
    <div class="navbar bg-base-200">
      <div class="flex-1"></div>
      <div class="flex items-center gap-1">
        <SearchField />
      </div>
    </div>
  {/snippet}
</Story>
