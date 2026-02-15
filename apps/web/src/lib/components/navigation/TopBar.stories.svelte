<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TopBar from './TopBar.svelte';

  const { Story } = defineMeta({
    title: 'Navigation/TopBar',
    component: TopBar,
    globals: {
      viewport: { value: undefined, isRotated: false },
    },
  });
</script>

<Story name="Desktop">
  {#snippet children()}
    <div style="width: 1024px;">
      <TopBar />
    </div>
  {/snippet}
</Story>

<Story name="Mobile" globals={{ viewport: { value: 'mobile1', isRotated: false } }}>
  {#snippet children()}
    <div style="width: 375px;">
      <TopBar />
    </div>
  {/snippet}
</Story>

<Story name="Tablet" globals={{ viewport: { value: 'tablet', isRotated: false } }}>
  {#snippet children()}
    <div style="width: 768px;">
      <TopBar />
    </div>
  {/snippet}
</Story>

<Story name="Full Width">
  <TopBar />
</Story>
