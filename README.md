# tvh-guide-ng

Electronic Program Guide (EPG) for TVHeadend.

## Monorepo Structure

```
tvh-guide-ng/
├── apps/
│   └── web/                 # SvelteKit EPG frontend
├── services/
│   └── epg-service/         # EPG data backend service
├── libs/
│   └── shared/              # Common types, utilities, constants
└── docs/                    # Project documentation
```

All packages use the `@tvh-guide/` scope (e.g., `@tvh-guide/shared`).

## Quick Start

```bash
# Install Volta (manages Node.js & pnpm versions)
curl https://get.volta.sh | bash

# Install pinned toolchain (versions from package.json)
volta install node pnpm

# Install dependencies
pnpm install

# Run all packages in dev mode
pnpm dev
```

See [Installation.md](./Installation.md) for detailed setup instructions.

## Documentation

- [Installation & CLI Reference](./Installation.md)
- [Architecture & Design Guide](./docs/DESIGN_GUIDE.md)
- [Coding Style](./docs/CODING_STYLE.md)
