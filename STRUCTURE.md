# Repository Structure

This document defines the organizational structure of the `tvh-guide-ng` monorepo and provides clear guidelines on where to place different types of code.

## Directory Layout

```
tvh-guide-ng/
├── apps/                    # User-facing applications
│   ├── cli/                 # Command-line interface for TVHeadend
│   └── web/                 # SvelteKit EPG frontend
├── services/                # Backend services
│   ├── epg-cache/           # EPG caching service with SQLite + fuzzy search
│   ├── hls-proxy/           # HLS proxy service with ffmpeg orchestration
│   └── epg-service/         # EPG data backend service
├── libs/                    # Shared libraries
│   ├── epg-cache-client/    # Type-safe EPG Cache service API client
│   ├── shared/              # Common types, utilities, constants
│   └── tvheadend-client/    # Type-safe TVHeadend API client
├── docker/                  # Docker build & deployment files
│   ├── web/                 # Web app Dockerfile
│   ├── epg-cache/           # EPG Cache service Dockerfile
│   ├── docker-compose.yml   # Working compose stack
│   ├── docker-compose.template.yml  # Fully documented template
│   ├── build.sh             # Image build script
│   └── .env.example         # Environment variable template
└── docs/                    # Project documentation
```

## Package Scoping

All packages use the `@tvh-guide/` namespace:

- `@tvh-guide/cli` — Command-line interface for TVHeadend
- `@tvh-guide/web` — SvelteKit EPG frontend (SSR, Tailwind CSS v4, DaisyUI v5, PWA)
- `@tvh-guide/epg-cache` — EPG caching service with SQLite storage and fuzzy search
- `@tvh-guide/hls-proxy` — HLS proxy service for live channel transcoding
- `@tvh-guide/epg-service` — EPG backend service
- `@tvh-guide/epg-cache-client` — Type-safe EPG Cache service API client
- `@tvh-guide/shared` — Shared types and utilities
- `@tvh-guide/tvheadend-client` — Type-safe TVHeadend API client

---

## 📱 `apps/` — User-Facing Applications

**Purpose**: End-user applications that provide interactive interfaces.

**What belongs here**:

- Frontend web applications (SvelteKit, React, etc.)
- Desktop applications (Electron, Tauri, etc.)
- Mobile applications (if added in the future)
- Admin panels or dashboards
- Command-line interface tools
- Any application with a user interface or interactive experience

**What does NOT belong here**:

- Backend services (use `services/` instead)
- Shared libraries (use `libs/` instead)
- CLI tools that are tightly coupled to a specific service (keep with the service)

**Dependency rules**:

- ✅ CAN depend on `libs/` packages
- ✅ CAN consume APIs from `services/` (via HTTP/network)
- ❌ CANNOT depend directly on `services/` packages
- ❌ CANNOT depend on other `apps/` packages

**When to add a new app**:

- When creating a new user-facing interface
- When building a separate application with its own deployment lifecycle
- When the codebase needs a distinct entry point for end users

**Example packages**:

- `apps/cli` — Command-line interface for managing TVHeadend EPG and recordings
- `apps/web` — SvelteKit EPG web app (Svelte 5, Tailwind CSS v4, DaisyUI v5, Catppuccin themes, PWA)
- `apps/admin` — (future) Admin configuration panel
- `apps/mobile` — (future) Mobile EPG app

---

## ⚙️ `services/` — Backend Services

**Purpose**: Backend services that handle business logic, data processing, and API endpoints.

**What belongs here**:

- REST APIs and GraphQL servers
- Data processing services
- Background workers and schedulers
- Microservices with specific responsibilities
- Services that interact with databases or external APIs

**What does NOT belong here**:

- Frontend code (use `apps/` instead)
- Shared utilities used by multiple services (use `libs/` instead)
- Pure data transformation logic (consider `libs/` if reusable)

**Dependency rules**:

- ✅ CAN depend on `libs/` packages
- ❌ CANNOT depend on `apps/` packages
- ❌ CANNOT depend on other `services/` packages directly
  - Services communicate via network APIs, not code imports
  - This ensures loose coupling and independent deployability

**When to add a new service**:

- When introducing a new API or backend capability
- When splitting functionality for independent scaling/deployment
- When isolating a specific domain or responsibility

**Example packages**:

- `services/epg-cache` — EPG caching with SQLite + MiniSearch (syncs from TVHeadend, serves HTTP API)
- `services/hls-proxy` — Live HLS proxy that resolves TVHeadend channels and orchestrates ffmpeg transcodings per channel
- `services/epg-service` — EPG data backend
- `services/auth-service` — (future) Authentication service
- `services/recording-service` — (future) Recording management

---

## 📦 `libs/` — Shared Libraries

**Purpose**: Reusable code shared across multiple packages in the monorepo.

**What belongs here**:

- TypeScript types and interfaces
- Utility functions and helpers
- Constants and configuration schemas
- Validation logic
- Domain models
- API client libraries
- UI component libraries (if shared across apps)

**What does NOT belong here**:

- Application-specific code (use `apps/` instead)
- Service-specific business logic (use `services/` instead)
- Code used by only one package (keep it local)

**Dependency rules**:

- ❌ CANNOT depend on `apps/` packages
- ❌ CANNOT depend on `services/` packages
- ✅ CAN depend on other `libs/` packages (but minimize coupling)
- ✅ CAN depend on external npm packages

**When to add a new lib**:

- When code is used by 2+ packages
- When defining shared contracts (types, interfaces)
- When extracting domain logic that should be tested independently

**Example packages**:

- `libs/epg-cache-client` — Type-safe client for the EPG Cache service HTTP API
- `libs/shared` — Common types and utilities
- `libs/tvheadend-client` — Type-safe TVHeadend API client library
- `libs/ui-components` — (future) Shared UI component library

---

## 📚 `docs/` — Documentation

**Purpose**: Project-wide documentation that doesn't belong in individual packages.

**What belongs here**:

- Architecture guides
- Coding standards and style guides
- Decision records (ADRs)
- API documentation
- Deployment guides
- Contributing guidelines

**Current files**:

- `docs/DESIGN_GUIDE.md` — Architecture principles
- `docs/CODING_STYLE.md` — Code style conventions
- `docs/api/index.html` — Unified API docs landing page (links to all API viewers)
- `docs/api/tvheadend/` — Complete TVHeadend API documentation
  - OpenAPI 3.1 specification (`openapi.yaml`)
  - Authentication, pagination, filtering, error handling guides
  - Code examples (curl, JavaScript, Python)
  - Use case walkthroughs
- `docs/api/epg-cache/` — EPG Cache service API documentation
  - OpenAPI 3.1 specification (`openapi.yaml`)
  - Stoplight Elements viewer (`index.html`)
  - curl examples in README

---

## Decision Flowchart

Use this flowchart to decide where to place new code:

```
Does it have a user interface?
├─ YES → apps/
└─ NO
   ├─ Is it a backend service/API?
   │  └─ YES → services/
   └─ NO
      ├─ Is it used by 2+ packages?
      │  └─ YES → libs/
      └─ NO → Keep it in the package that uses it
```

---

## Dependency Architecture

```
┌─────────────┐
│   apps/     │  ← User-facing applications
└──────┬──────┘
       │ (HTTP/API calls)
       ↓
┌─────────────┐
│  services/  │  ← Backend services
└──────┬──────┘
       │ (code imports)
       ↓
┌─────────────┐
│   libs/     │  ← Shared libraries
└─────────────┘
```

**Key principles**:

1. Dependencies flow downward only
2. Services communicate via APIs, not imports
3. Shared code lives in `libs/`
4. Each package has a clear, single responsibility

---

## Adding a New Package

When adding a new package to the monorepo:

1. **Choose the correct directory** using the decision flowchart above
2. **Create the package directory** with a descriptive name
3. **Add package.json** with the `@tvh-guide/` scope
4. **Update pnpm-workspace.yaml** if needed (should auto-include)
5. **Update this STRUCTURE.md file** with the new package in the relevant section
6. **Update README.md** if the package changes the overall architecture
7. **Document the package's purpose** in its own README.md

---

## Maintenance

**⚠️ IMPORTANT**: This file must be kept in sync with the actual repository structure.

**When to update this file**:

- ✅ When adding a new package (app, service, or lib)
- ✅ When removing a package
- ✅ When changing a package's purpose or responsibilities
- ✅ When modifying the dependency architecture
- ✅ When adding new categories or guidelines

**Who should update this file**:

- Anyone adding new packages or restructuring the repository
- Maintainers during code reviews
- Developers when they notice inconsistencies

---

## Questions?

If you're unsure where to place code:

1. Review the decision flowchart above
2. Check if similar code already exists
3. Follow the principle of least privilege (start local, extract to libs/ only when needed)
4. Ask in code review if still uncertain
