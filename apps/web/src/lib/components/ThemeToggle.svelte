<script lang="ts">
  import { Sun as SunIcon, Moon as MoonIcon } from 'lucide-svelte';

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

<label class="swap swap-rotate btn btn-ghost btn-circle" aria-label="Toggle theme">
  <input type="checkbox" checked={theme === 'latte'} onchange={toggleTheme} />
  <SunIcon class="swap-on size-5" />
  <MoonIcon class="swap-off size-5" />
</label>
