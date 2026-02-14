import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  // Global ignores
  {
    ignores: ['dist/', 'build/', 'node_modules/', 'coverage/', 'docs/', '**/*.js', '**/*.mjs', '**/*.d.ts'],
  },

  // Base: recommended + strict type-checked
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,

  // TypeScript parser options for all TS files
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Allow numbers and booleans in template literals (common TS pattern)
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true, allowBoolean: true }],
    },
  },

  // Test files: disable type-checked rules (tests are excluded from tsconfig)
  // and relax strict rules for mocking patterns
  {
    files: ['**/__tests__/**/*.ts', '**/*.test.ts'],
    ...tseslint.configs.disableTypeChecked,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // CLI app: Commander.js APIs return `any`; relax unsafe-* rules
  {
    files: ['apps/cli/src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
    },
  },

  // Config files: disable type-checked rules (no tsconfig covers them)
  {
    files: ['**/tsup.config.ts', '**/vitest.config.ts'],
    ...tseslint.configs.disableTypeChecked,
  },

  // Prettier must be last to disable conflicting style rules
  eslintConfigPrettier,
);
