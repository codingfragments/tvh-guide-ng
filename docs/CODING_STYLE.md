# Coding Style

TypeScript conventions for the tvh-guide-ng monorepo.

## Strict Types

- `strict: true` in all `tsconfig.json` files.
- No `any` — use `unknown` when the type is truly unknown, then narrow.
- Prefer explicit return types on exported functions.

## Naming Conventions

| Element          | Style       | Example           |
| ---------------- | ----------- | ----------------- |
| Variables        | camelCase   | `channelCount`    |
| Functions        | camelCase   | `fetchPrograms()` |
| Types/Interfaces | PascalCase  | `EpgEntry`        |
| Enums            | PascalCase  | `ChannelType`     |
| Constants        | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Files            | kebab-case  | `epg-entry.ts`    |
| Directories      | kebab-case  | `epg-service/`    |

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

### Prettier

Formatting is handled by Prettier with a single root config (`.prettierrc.json`).

| Setting         | Value |
| --------------- | ----- |
| Single quotes   | Yes   |
| Trailing commas | All   |
| Tab width       | 2     |
| Semicolons      | Yes   |
| Print width     | 120   |
| End of line     | LF    |

Commands:

```bash
pnpm format         # format all files
pnpm format:check   # check without writing (CI)
```

### ESLint

ESLint v9 flat config lives at `eslint.config.mjs` (root). Per-package lint scripts run `eslint src/`.

| Layer                | Config                                            |
| -------------------- | ------------------------------------------------- |
| Base                 | `eslint/recommended` + `strictTypeChecked`        |
| Type-aware parsing   | `projectService: true` (auto-discovers tsconfigs) |
| Svelte files         | `eslint-plugin-svelte` + `svelte-eslint-parser`   |
| Test files           | Type-checked rules disabled; `any` allowed        |
| CLI command handlers | `no-unsafe-*` relaxed (Commander returns `any`)   |
| Config files         | Type-checked rules fully disabled                 |
| Style conflicts      | `eslint-config-prettier` (must be last)           |

Commands:

```bash
pnpm lint            # lint all packages
pnpm -r lint         # same (root script delegates)
```

### Rule Customizations

- `restrict-template-expressions`: numbers and booleans allowed in template literals
- `no-unnecessary-condition`: `captureStackTrace?.()` suppressed (V8-specific API)
- Test files: `disableTypeChecked` + `no-explicit-any` off + `no-non-null-assertion` off

## Svelte

### Runes (Svelte 5)

All components use Svelte 5 runes — no legacy `export let` or `$:` reactive statements.

| Rune         | Purpose                      | Example                                   |
| ------------ | ---------------------------- | ----------------------------------------- |
| `$state()`   | Reactive variable            | `let count = $state(0);`                  |
| `$derived()` | Computed value               | `const double = $derived(count * 2);`     |
| `$props()`   | Component props              | `let { title, items } = $props();`        |
| `$effect()`  | Side effect (runs on change) | `$effect(() => { console.log(count); });` |

### Component Files

- SvelteKit route components: `+page.svelte`, `+layout.svelte`, `+error.svelte`
- Server-side logic: `+page.server.ts`, `+layout.server.ts`, `+server.ts`
- Reusable components: PascalCase in `$lib/components/` (e.g., `ChannelCard.svelte`)
- Use `{@render children()}` instead of `<slot />`

### Icons

Use [Lucide](https://lucide.dev/icons/) via `lucide-svelte`. Never use inline SVG paths for icons.

**Import convention**: always alias with an `Icon` suffix so the component name describes its role in the template.

```svelte
<script lang="ts">
  import { Search as SearchIcon, Calendar as CalendarIcon } from 'lucide-svelte';
</script>

<button class="btn btn-primary">
  <SearchIcon class="size-5" />
  Search
</button>
```

**Sizing and color**: use Tailwind utility classes (`size-5`, `size-6`, `text-primary`, etc.). Icons inherit `currentColor` by default.

**Finding icons**: browse the full catalog at https://lucide.dev/icons/ -- use the search bar to find icons by name or concept.

### Styling

- Tailwind CSS v4 with CSS-first config (no `tailwind.config.js`)
- DaisyUI v5 component classes for consistent theming
- Catppuccin Macchiato (dark, default) and Latte (light) themes
- Theme switching via `data-theme` attribute on `<html>`

### Data Loading

- Use `+page.server.ts` load functions for server-side data
- Private env vars via `$env/static/private` (never exposed to browser)
- SvelteKit API routes (`+server.ts`) as backend stubs — not generic proxies
