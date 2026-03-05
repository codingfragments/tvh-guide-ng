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
          if (id === '$env/dynamic/public') return '\0$env/dynamic/public';
        },
        load(id: string) {
          const url = process.env.PUBLIC_EPG_CACHE_URL ?? 'http://localhost:3000';
          const presets = process.env.PUBLIC_TIMESELECT_PRESETS ?? '06:00,12:00,20:15,22:00';
          const customAppearance = process.env.PUBLIC_TIMESELECT_CUSTOM_APPEARANCE ?? 'outline';

          if (id === '\0$env/static/public') {
            return [
              `export const PUBLIC_EPG_CACHE_URL = ${JSON.stringify(url)};`,
              `export const PUBLIC_TIMESELECT_PRESETS = ${JSON.stringify(presets)};`,
              `export const PUBLIC_TIMESELECT_CUSTOM_APPEARANCE = ${JSON.stringify(customAppearance)};`,
            ].join('\n');
          }

          if (id === '\0$env/dynamic/public') {
            return `export const env = ${JSON.stringify({
              PUBLIC_EPG_CACHE_URL: url,
              PUBLIC_TIMESELECT_PRESETS: presets,
              PUBLIC_TIMESELECT_CUSTOM_APPEARANCE: customAppearance,
            })};`;
          }
        },
      },
    );
    return config;
  },
};

export default config;
