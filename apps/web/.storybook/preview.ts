import type { Preview } from '@storybook/sveltekit';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../src/app.css';

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: {
        macchiato: 'macchiato',
        latte: 'latte',
      },
      defaultTheme: 'macchiato',
      attributeName: 'data-theme',
    }),
  ],
  parameters: {
    sveltekit_experimental: {
      state: {
        page: {
          url: new URL('http://localhost/now'),
        },
      },
    },
  },
};

export default preview;
