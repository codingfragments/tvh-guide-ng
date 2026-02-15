<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import TopBar from './TopBar.svelte';

  const { Story } = defineMeta({
    title: 'Components/TopBar',
    component: TopBar,
  });
</script>

<Story name="Desktop" parameters={{ viewport: { defaultViewport: 'responsive' } }}>
  {#snippet children()}
    <div style="width: 1024px;">
      <TopBar />
    </div>
  {/snippet}
</Story>

<Story name="Mobile" parameters={{ viewport: { defaultViewport: 'mobile1' } }}>
  {#snippet children()}
    <div style="width: 375px;">
      <TopBar />
    </div>
  {/snippet}
</Story>

<Story name="Tablet" parameters={{ viewport: { defaultViewport: 'tablet' } }}>
  {#snippet children()}
    <div style="width: 768px;">
      <TopBar />
    </div>
  {/snippet}
</Story>

<Story name="Full Width">
  <TopBar />
</Story>
