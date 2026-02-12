# Architecture & Design Guide

## Principles

1. **Separation of concerns** — Frontend, backend, and shared code live in distinct packages.
2. **Shared-nothing services** — Each service owns its data and logic; communication happens through typed APIs.
3. **Typed contracts** — `@tvh-guide/shared` defines the interfaces that services and apps depend on, ensuring type safety across package boundaries.

## Dependency Flow

```
libs/shared
    ↑
services/epg-service
    ↑
apps/web
```

- `libs/` packages have zero internal dependencies.
- `services/` may depend on `libs/` but never on `apps/`.
- `apps/` may depend on `libs/` and consume APIs from `services/`.

## API Design

- Backend services expose typed request/response interfaces defined in `@tvh-guide/shared`.
- Use JSON over HTTP for service communication.
- Validate inputs at service boundaries; trust internal types.

## Error Handling

- Fail fast on unexpected states — throw rather than silently swallow.
- Use typed error responses at API boundaries (HTTP status codes + error body).
- Log errors with sufficient context (operation, input, stack trace).
- Never expose internal details (stack traces, file paths) to the client.
