<script lang="ts">
  import { pwaInfo } from 'virtual:pwa-info';
  import { Menu as MenuIcon, Sun as SunIcon, Moon as MoonIcon } from 'lucide-svelte';
  import '../app.css';

  let { children } = $props();

  const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

  let theme = $state('macchiato');

  function toggleTheme() {
    theme = theme === 'macchiato' ? 'latte' : 'macchiato';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tvh-guide-theme', theme);
  }

  $effect(() => {
    const saved = localStorage.getItem('tvh-guide-theme');
    if (saved === 'macchiato' || saved === 'latte') {
      theme = saved;
      document.documentElement.setAttribute('data-theme', saved);
    }
  });
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html webManifestLink}
</svelte:head>

<div class="drawer lg:drawer-open">
  <input id="sidebar-drawer" type="checkbox" class="drawer-toggle" />

  <div class="drawer-content flex min-h-screen flex-col">
    <!-- Navbar -->
    <div class="navbar bg-base-200">
      <div class="flex-none lg:hidden">
        <label for="sidebar-drawer" class="btn btn-square btn-ghost" aria-label="Open menu">
          <MenuIcon class="size-5" />
        </label>
      </div>
      <div class="flex-1">
        <a href="/" class="btn btn-ghost text-xl">TVH Guide</a>
      </div>
      <div class="flex-none">
        <!-- Theme toggle -->
        <label class="swap swap-rotate btn btn-ghost btn-circle" aria-label="Toggle theme">
          <input type="checkbox" checked={theme === 'latte'} onchange={toggleTheme} />
          <SunIcon class="swap-on size-5" />
          <MoonIcon class="swap-off size-5" />
        </label>
      </div>
    </div>

    <!-- Page content -->
    <main class="flex-1 p-4 lg:p-6">
      {@render children()}
    </main>

    <!-- Footer -->
    <footer class="footer footer-center bg-base-200 p-4 text-base-content">
      <p>TVH Guide &mdash; Electronic Program Guide for TVHeadend</p>
    </footer>
  </div>

  <!-- Sidebar drawer (mobile) -->
  <div class="drawer-side">
    <label for="sidebar-drawer" class="drawer-overlay" aria-label="Close menu"></label>
    <ul class="menu bg-base-200 min-h-full w-64 p-4">
      <li><a href="/">Home</a></li>
      <li><a href="/plan">Plan</a></li>
    </ul>
  </div>
</div>
