<script lang="ts">
  import { pwaInfo } from 'virtual:pwa-info';
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block h-5 w-5 stroke-current"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </label>
      </div>
      <div class="flex-1">
        <a href="/" class="btn btn-ghost text-xl">TVH Guide</a>
      </div>
      <div class="flex-none">
        <!-- Theme toggle -->
        <label class="swap swap-rotate btn btn-ghost btn-circle" aria-label="Toggle theme">
          <input type="checkbox" checked={theme === 'latte'} onchange={toggleTheme} />
          <!-- Sun icon (latte/light) -->
          <svg class="swap-on h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"
            />
          </svg>
          <!-- Moon icon (macchiato/dark) -->
          <svg class="swap-off h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"
            />
          </svg>
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
