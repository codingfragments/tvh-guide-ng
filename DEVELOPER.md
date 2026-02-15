# Developer Guide

How to develop, build, test, and extend the tvh-guide-ng monorepo.

## Prerequisites

- **Node.js** and **pnpm** managed by [Volta](https://volta.sh/) (versions pinned in root `package.json`)
- A running **TVHeadend** instance (for the epg-cache service)

```bash
# Install Volta (handles Node.js + pnpm versions automatically)
curl https://get.volta.sh | bash
```

## Initial Setup

```bash
git clone <repo-url> && cd tvh-guide-ng
pnpm install
```

### EPG Cache Service Configuration

Copy the example env file and fill in your TVHeadend connection details:

```bash
cp services/epg-cache/.env.example services/epg-cache/.env
```

Required variables:

| Variable | Default | Description |
| --- | --- | --- |
| `TVH_URL` | *(required)* | TVHeadend base URL (e.g. `http://tvheadend:9981`) |
| `TVH_USERNAME` | `""` | TVHeadend username |
| `TVH_PASSWORD` | `""` | TVHeadend password |
| `EPG_HTTP_PORT` | `3000` | Port the cache service listens on |
| `EPG_REFRESH_INTERVAL` | `3600` | Seconds between EPG data refreshes |
| `EPG_SQLITE_PATH` | `./data/epg-cache.db` | Path to the SQLite database file |

## Running the Full Stack

```bash
pnpm dev
```

This starts all packages in parallel:

| Package | What happens | URL / Port |
| --- | --- | --- |
| `apps/web` | Vite dev server with HMR | `http://localhost:5173` |
| `services/epg-cache` | Hono HTTP server, auto-restarts on changes | `http://localhost:3000` |
| `libs/tvheadend-client` | Rebuilds on source changes | *(library)* |
| `libs/epg-cache-client` | Rebuilds on source changes | *(library)* |
| `apps/cli` | Rebuilds on source changes | *(binary)* |

### Running Individual Packages

```bash
pnpm --filter @tvh-guide/web dev          # web app only
pnpm --filter @tvh-guide/epg-cache dev    # cache service only
```

## Building

```bash
pnpm build          # build all packages
```

Per-package build output:

| Package | Tool | Output |
| --- | --- | --- |
| `apps/web` | Vite + SvelteKit | `apps/web/build/` |
| `apps/cli` | tsup | `apps/cli/dist/` |
| `services/epg-cache` | tsup | `services/epg-cache/dist/` |
| `libs/*` | tsup | `libs/*/dist/` |

### Running Production Builds

```bash
# Web app
node apps/web/build/index.js

# EPG cache service
node services/epg-cache/dist/index.js

# CLI
node apps/cli/dist/cli.js
# or via the bin alias after linking:
pnpm --filter @tvh-guide/cli start
```

## Testing

```bash
pnpm -r test              # run all tests once
pnpm -r test:watch        # watch mode across all packages
```

Per-package:

```bash
pnpm --filter @tvh-guide/epg-cache test
pnpm --filter @tvh-guide/epg-cache test:watch
pnpm --filter @tvh-guide/epg-cache test:coverage
```

All packages use **Vitest**.

## Linting and Formatting

```bash
pnpm lint                 # ESLint across all packages
pnpm format               # Prettier (write)
pnpm format:check         # Prettier (check only, for CI)
```

ESLint v9 flat config is at the repo root (`eslint.config.mjs`). Prettier config is in `.prettierrc.json`.

## API Documentation

```bash
pnpm validate:openapi     # validate OpenAPI specs with Spectral
pnpm docs:serve           # serve API docs at http://localhost:8080
pnpm docs:watch           # serve with auto-reload on spec changes
```

OpenAPI specs live in `docs/api/tvheadend/` and `docs/api/epg-cache/`.

## Icons

The web app uses [Lucide](https://lucide.dev/icons/) for all icons via `lucide-svelte`.

### Convention

Always alias imports with an `Icon` suffix for readability:

```svelte
<script lang="ts">
  import { Search as SearchIcon, Tv as TvIcon } from 'lucide-svelte';
</script>

<SearchIcon class="size-5" />
<TvIcon class="size-6 text-primary" />
```

Do **not** use inline SVG paths -- use Lucide components instead.

### Sizing and Color

Icons are inline SVGs styled with Tailwind classes. They inherit `currentColor` by default.

- `size-4` / `size-5` / `size-6` for width + height
- `text-primary`, `text-warning`, etc. for color

### Finding Icons

Browse the full catalog with search at: https://lucide.dev/icons/

## Web App Layout Architecture

The web app (`apps/web`) uses a responsive shell with three layout zones:

| Breakpoint | Sidebar | Bottom Dock | Search |
| --- | --- | --- | --- |
| Phone (<md) | Hidden | Visible (icons + labels) | Icon, opens overlay |
| Tablet (md-lg) | Hidden | Visible | Inline field |
| Desktop (lg+) | Persistent, collapsible | Hidden | Inline field |

### Key files

| File | Purpose |
| --- | --- |
| `src/lib/navigation.ts` | Centralized nav config (routes, icons, labels, `isActive` helper) |
| `src/lib/components/Sidebar.svelte` | Desktop sidebar with collapse/expand to icon rail |
| `src/lib/components/BottomNav.svelte` | Mobile/tablet dock (DaisyUI v5 `dock`) |
| `src/lib/components/TopBar.svelte` | Top bar (brand on mobile, search, theme toggle) |
| `src/lib/components/SearchField.svelte` | Search input (inline on md+, icon-to-overlay on mobile) |
| `src/lib/components/ThemeToggle.svelte` | Dark/light theme swap |

### Adding a nav item

1. Add an entry to `mainNavItems` or `utilityNavItems` in `src/lib/navigation.ts`
2. Create the route page under `src/routes/<name>/+page.svelte`
3. Both Sidebar and BottomNav render from the same config automatically

### Sidebar collapse state

Persisted in `localStorage` key `tvh-guide-sidebar-collapsed`.

## Extending the Monorepo

### Adding a New Package

1. Create the directory under the correct parent (`apps/`, `services/`, or `libs/`)
2. Add a `package.json` with the `@tvh-guide/` scope
3. pnpm auto-discovers it via `pnpm-workspace.yaml` globs
4. Update `STRUCTURE.md` with the new package

See `STRUCTURE.md` for the decision flowchart on where to place new code.

### Dependency Rules

```
apps/      CAN depend on libs/, consume services/ via HTTP APIs
services/  CAN depend on libs/, CANNOT import other services/
libs/      CANNOT depend on apps/ or services/
```

### Adding Dependencies

```bash
# Add to a specific package
pnpm --filter @tvh-guide/web add some-package

# Add a workspace dependency
pnpm --filter @tvh-guide/web add @tvh-guide/shared --workspace

# Add a root dev dependency
pnpm add -D -w some-tool
```

## Branching Strategy

- Use **gitflow** for bigger features: branch from `main`, merge back via PR
- Small fixes can go directly to `main`

## Related Documentation

- [STRUCTURE.md](STRUCTURE.md) -- monorepo layout and package placement guidelines
- [Installation.md](Installation.md) -- setup and pnpm workspace commands
- [docs/CODING_STYLE.md](docs/CODING_STYLE.md) -- TypeScript, Svelte, and formatting conventions
- [docs/DESIGN_GUIDE.md](docs/DESIGN_GUIDE.md) -- architecture principles and dependency flow
