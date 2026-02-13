import { defineConfig } from 'tsup';

export default defineConfig([
  {
    // CLI entry with shebang
    entry: {
      cli: 'src/cli.ts',
    },
    format: ['esm'],
    dts: true,
    clean: true,
    sourcemap: true,
    shims: true,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
  {
    // Library entry without shebang
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    shims: true,
  },
]);
