# Claude Code Instructions

This file contains project-specific instructions for Claude Code when working in this repository.

## Repository Structure Management

**CRITICAL**: Always update `STRUCTURE.md` when making structural changes to the monorepo.

### Update triggers
- Adding a new package to `apps/`, `services/`, or `libs/`
- Removing a package
- Changing a package's purpose or scope
- Modifying the dependency architecture
- Adding new organizational categories

After adding, removing, or modifying packages, you MUST:
1. Update the relevant section in `STRUCTURE.md`
2. Update the directory layout diagram if the structure changes
3. Add example entries for new packages

## Monorepo Architecture

This is a **pnpm workspace** monorepo with strict separation of concerns:

### Package Organization

```
apps/      → User-facing applications (web, mobile, desktop)
services/  → Backend services (APIs, workers, processors)
libs/      → Shared libraries (types, utilities, components)
docs/      → Project documentation
```

### Naming Convention
All packages use the `@tvh-guide/` scope:
- `@tvh-guide/web`
- `@tvh-guide/epg-service`
- `@tvh-guide/shared`

### Dependency Rules

```
apps/      CAN depend on libs/, consume services/ via APIs
services/  CAN depend on libs/, CANNOT import other services/
libs/      CANNOT depend on apps/ or services/
```

Services communicate via network APIs (HTTP/GraphQL), not code imports.

## File Organization

- Keep application-specific code in the app/service that uses it
- Extract to `libs/` only when code is used by 2+ packages
- Follow the decision flowchart in `STRUCTURE.md` when uncertain

## Documentation

- Architecture decisions → `docs/DESIGN_GUIDE.md`
- Code style conventions → `docs/CODING_STYLE.md`
- Structure and organization → `STRUCTURE.md`
- Installation instructions → `Installation.md`

## Development Workflow

- Use `pnpm` for all package management
- Follow the patterns in `docs/CODING_STYLE.md`
- Maintain type safety across package boundaries
- use gitflow when implementing bigger features
- Update documentation when changing architecture

## Code Quality

### Markdownlint Configuration
- `.markdownlint.json` contains tuned rules to reduce false positives
- `.markdownlintignore` excludes `CLAUDE.md` and generated files from linting
- Line length increased to 120 chars for better readability
- Bare URLs allowed (MD034 disabled)
- Emphasis-as-header warnings disabled (MD036)

## Version Control

This file is committed to the repository and syncs across systems via Git, ensuring consistent behavior regardless of which machine or client is being used.
