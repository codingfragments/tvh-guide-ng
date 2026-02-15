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
    config.plugins.push(tailwindcss());
    return config;
  },
};

export default config;
