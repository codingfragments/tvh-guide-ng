<script module lang="ts">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import Sidebar from './Sidebar.svelte';

  const { Story } = defineMeta({
    title: 'Components/Sidebar',
    component: Sidebar,
    parameters: {
      layout: 'fullscreen',
    },
  });
</script>

<!-- Force lg: visibility with a wide container -->
<Story
  name="Active: Now"
  parameters={{
    sveltekit_experimental: { state: { page: { url: new URL('http://localhost/now') } } },
  }}
>
  {#snippet children()}
    <div style="width: 1280px; height: 600px;" class="flex">
      <Sidebar />
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
    <div style="width: 1280px; height: 600px;" class="flex">
      <Sidebar />
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
    <div style="width: 1280px; height: 600px;" class="flex">
      <Sidebar />
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
    <div style="width: 1280px; height: 600px;" class="flex">
      <Sidebar />
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
    <div style="width: 1280px; height: 600px;" class="flex">
      <Sidebar />
    </div>
  {/snippet}
</Story>

<Story name="Collapsed (Icon Rail)">
  {#snippet children()}
    <div style="width: 1280px; height: 600px;" class="flex">
      <p class="absolute top-2 right-2 text-sm text-base-content/60 z-10">
        Click the collapse button at the bottom of the sidebar
      </p>
      <Sidebar />
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
    <div style="width: 1280px; height: 600px;" class="flex">
      <Sidebar />
    </div>
  {/snippet}
</Story>
