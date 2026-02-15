<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BottomNav from './BottomNav.svelte';

  const { Story } = defineMeta({
    title: 'Components/BottomNav',
    component: BottomNav,
    parameters: {
      layout: 'fullscreen',
    },
  });
</script>

<!-- Container <1024px so lg:hidden stays visible -->
<Story
  name="Active: Now"
  parameters={{
    sveltekit_experimental: { state: { page: { url: new URL('http://localhost/now') } } },
  }}
>
  {#snippet children()}
    <div style="width: 375px; height: 200px;" class="flex flex-col justify-end">
      <BottomNav />
    </div>
  {/snippet}
</Story>

<Story
  name="Active: Guide"
  parameters={{
    sveltekit_experimental: { state: { page: { url: new URL('http://localhost/guide') } } },
  }}
>
  {#snippet children()}
    <div style="width: 375px; height: 200px;" class="flex flex-col justify-end">
      <BottomNav />
    </div>
  {/snippet}
</Story>

<Story
  name="Active: Channels"
  parameters={{
    sveltekit_experimental: { state: { page: { url: new URL('http://localhost/channels') } } },
  }}
>
  {#snippet children()}
    <div style="width: 375px; height: 200px;" class="flex flex-col justify-end">
      <BottomNav />
    </div>
  {/snippet}
</Story>

<Story
  name="Active: Recordings"
  parameters={{
    sveltekit_experimental: { state: { page: { url: new URL('http://localhost/recordings') } } },
  }}
>
  {#snippet children()}
    <div style="width: 375px; height: 200px;" class="flex flex-col justify-end">
      <BottomNav />
    </div>
  {/snippet}
</Story>

<Story
  name="Active: Settings"
  parameters={{
    sveltekit_experimental: { state: { page: { url: new URL('http://localhost/settings') } } },
  }}
>
  {#snippet children()}
    <div style="width: 375px; height: 200px;" class="flex flex-col justify-end">
      <BottomNav />
    </div>
  {/snippet}
</Story>

<Story
  name="No Active Route"
  parameters={{
    sveltekit_experimental: { state: { page: { url: new URL('http://localhost/') } } },
  }}
>
  {#snippet children()}
    <div style="width: 375px; height: 200px;" class="flex flex-col justify-end">
      <BottomNav />
    </div>
  {/snippet}
</Story>

<Story
  name="Tablet Width"
  parameters={{
    sveltekit_experimental: { state: { page: { url: new URL('http://localhost/now') } } },
  }}
>
  {#snippet children()}
    <div style="width: 768px; height: 200px;" class="flex flex-col justify-end">
      <BottomNav />
    </div>
  {/snippet}
</Story>
