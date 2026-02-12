# Installation & CLI Reference

## Prerequisites

### Volta (Node.js version manager)

Volta pins exact Node.js and pnpm versions per project, so every contributor uses the same toolchain.

```bash
# Install Volta
curl https://get.volta.sh | bash

# Volta reads the "volta" key in package.json and installs automatically:
#   Node.js 22.14.0
#   pnpm 10.4.1
volta install node pnpm
```

## Setup

```bash
# Clone the repo
git clone <repo-url> && cd tvh-guide-ng

# Install all workspace dependencies
pnpm install
```

## Workspace Commands

### Running scripts across packages

```bash
# Run dev in all packages (parallel)
pnpm dev

# Build all packages
pnpm build

# Lint all packages
pnpm lint

# Clean all build artifacts
pnpm clean
```

### Targeting a specific package

```bash
# Run a script in a single package
pnpm --filter @tvh-guide/web dev
pnpm --filter @tvh-guide/epg-service build

# Add a dependency to a specific package
pnpm --filter @tvh-guide/web add svelte

# Add a shared workspace dependency
pnpm --filter @tvh-guide/web add @tvh-guide/shared --workspace
```

### Recursive operations

```bash
# Run a script in every package that defines it
pnpm -r test

# List all workspace packages
pnpm -r ls --depth -1
```
