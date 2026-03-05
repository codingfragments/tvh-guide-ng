# Now View Feature Plan

## Status

- Phase: Planning only
- Branch: `feature/now-view`
- Scope: Implement `/now` as current-program view using EPG Cache data

## What I See In The Example

The screenshot shows a list of "currently running" programs rendered as cards:

- Each card has a channel logo on the left.
- Main content includes:
  - program title (prominent)
  - secondary line (subtitle/summary/metadata)
  - airing time range (`HH:mm - HH:mm`)
- A progress indicator shows how far the current program has advanced.
- Visual style is clean and compact, with enough whitespace for readability.
- Layout can naturally stack on mobile and become multi-column on larger screens.

## Functional Goal

Build a `Now` view that, for a selected timestamp, lists all programs active at that timestamp.

Data source must be EPG Cache service (`/api/events/timerange`), not TVHeadend direct for event data.

## Data Semantics

Use the same time-window semantics already implemented in EPG Cache:

- Query: `start = ts`, `stop = ts`
- Backend rule: `event.start <= stop AND event.stop > start`

For `start = stop = ts`, this means: program started at or before `ts`, and ends after `ts`.
This matches "currently running" behavior.

## Proposed Architecture

### 1. Web Route API Layer

Add a web-server route to centralize now-query logic:

- `GET /api/now`
  - Query params:
    - `ts` (optional unix timestamp in seconds; default now)
    - `limit` (optional, default e.g. 200)
  - Internally calls EPG Cache: `GET /api/events/timerange?start=ts&stop=ts&limit=...`
  - Returns normalized payload for UI (including progress fields)

Rationale:

- Keeps UI simple
- Encapsulates timestamp parsing/validation and fallback logic
- Enables tests without mocking browser-side fetch deeply

### 2. Page Load

Use `apps/web/src/routes/now/+page.server.ts` to fetch initial dataset from `/api/now` and render SSR-first.

Optional next step after MVP: client-side auto-refresh every 30-60s.

### 3. UI Components

Create reusable components in `apps/web/src/lib/components/now/`:

- `NowEventCard.svelte`
  - uses `ChannelLogo` (`picon://channel/{channelName}`)
  - renders title, subline, time range, progress bar
- `NowEventGrid.svelte`
  - responsive grid/list wrapper
- Optional: `NowTimestampBar.svelte`
  - display selected timestamp and "jump to now" control

## Responsive Layout Plan

- Mobile (`< md`): 1 column cards, compact spacing
- Tablet (`md`): 2 columns
- Desktop (`xl`+): 3 columns

Suggested grid classes:

- `grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3`

Card internals:

- Left: logo (`ChannelLogo size="xl"` or responsive)
- Right: content stack with truncation on long text

## API/Model Plan

Define a stable UI shape for the `Now` view response:

```ts
interface NowEventItem {
  eventId: number;
  channelUuid: string;
  channelName: string;
  channelNumber?: number;
  title: string;
  subtitle?: string;
  summary?: string;
  start: number;
  stop: number;
  progressPct: number; // 0..100 at selected ts
  piconUrl: string; // e.g. picon://channel/Das Erste HD
}
```

```ts
interface NowResponse {
  timestamp: number;
  items: NowEventItem[];
  meta: {
    total: number;
    source: 'epg-cache';
  };
}
```

## Storybook Plan

For every new UI component, provide stories (project rule):

- `NowEventCard.stories.svelte`
  - `Default`
  - `LongText`
  - `NoSubtitle`
  - `NearEndProgress`
- `NowEventGrid.stories.svelte`
  - `Mobile`
  - `Tablet`
  - `Desktop`
  - `Empty`

Include viewport globals as documented in `DEVELOPER.md`.

## Testing Plan

### Unit

- timestamp parser (`ts` validation + fallback to current time)
- progress calculation (`progressPct` clamped 0..100)
- event-to-viewmodel mapper (title/subline fallback logic)

### Route tests

- `/api/now` returns 200 with default `ts`
- invalid `ts` returns 400
- EPG Cache upstream errors mapped predictably (5xx)

### Component tests (lightweight)

- card renders title/time/progress correctly
- grid renders empty state when no items

### Manual checks

- `/now` loads with real data
- logos render via `ChannelLogo`
- responsive behavior at mobile/tablet/desktop breakpoints

## GitFlow Execution Plan

1. Branch from `main`: `feature/now-view` (done)
2. Implement API route + page server load
3. Implement `now` components + responsive grid
4. Add stories
5. Add tests
6. Update docs (`DEVELOPER.md`, possibly `apps/web/README.md`)
7. Open PR: `feature/now-view -> main`
8. Merge via PR only

## Risks / Open Questions

- How many "now" events are expected (performance + limit tuning)?
  not so much, don't worry about this for now.

- Should sorting be by channel number asc by default? (recommended yes)
  yes
- Auto-refresh cadence desired for `/now` page? (MVP can be static-on-load)
  if the selector is on now update every 5min, if the selector is on a different time/date don't auto-refresh

- Should clicking a card deep-link to live playback (`/now/tv` with channel prefilled) in v1?
  no, will handle this later
