# Coding Style

TypeScript conventions for the tvh-guide-ng monorepo.

## Strict Types

- `strict: true` in all `tsconfig.json` files.
- No `any` — use `unknown` when the type is truly unknown, then narrow.
- Prefer explicit return types on exported functions.

## Naming Conventions

| Element          | Style        | Example              |
|------------------|-------------|----------------------|
| Variables        | camelCase   | `channelCount`       |
| Functions        | camelCase   | `fetchPrograms()`    |
| Types/Interfaces | PascalCase  | `EpgEntry`           |
| Enums            | PascalCase  | `ChannelType`        |
| Constants        | UPPER_SNAKE | `MAX_RETRY_COUNT`    |
| Files            | kebab-case  | `epg-entry.ts`       |
| Directories      | kebab-case  | `epg-service/`       |

## Imports

Order imports top to bottom:

1. Node built-ins (`node:fs`, `node:path`)
2. External packages (`svelte`, `express`)
3. Workspace packages (`@tvh-guide/shared`)
4. Relative imports (`./utils`)

Separate each group with a blank line.

## Functions

- Prefer `function` declarations for top-level/exported functions.
- Use arrow functions for callbacks and inline lambdas.
- Keep functions short — if it needs a comment to explain a section, extract that section.

## Linting & Formatting

ESLint and Prettier will be configured as packages are scaffolded. Planned rules:

- Prettier defaults (2-space indent, single quotes, trailing commas)
- ESLint strict TypeScript ruleset (`@typescript-eslint/strict-type-checked`)
