import type { StorybookConfig } from '@storybook/sveltekit';
import tailwindcss from '@tailwindcss/vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.svelte'],
  framework: '@storybook/sveltekit',
  addons: [
    '@storybook/addon-svelte-csf',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
  ],
  viteFinal(config) {
    config.plugins ??= [];
    config.plugins.push(
      tailwindcss(),
      {
        name: 'mock-sveltekit-env',
        resolveId(id: string) {
          if (id === '$env/static/public') return '\0$env/static/public';
        },
        load(id: string) {
          if (id === '\0$env/static/public') {
            const url = process.env.PUBLIC_EPG_CACHE_URL ?? 'http://localhost:3000';
            return `export const PUBLIC_EPG_CACHE_URL = ${JSON.stringify(url)};`;
          }
        },
      },
    );
    return config;
  },
};

export default config;
