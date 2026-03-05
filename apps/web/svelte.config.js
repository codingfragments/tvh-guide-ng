import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      out: 'build',
      precompress: true,
    }),
    alias: {
      '@tvh-guide/tvheadend-client': '../../libs/tvheadend-client/src/index.ts',
    },
    serviceWorker: {
      register: false,
    },
  },
};

export default config;
