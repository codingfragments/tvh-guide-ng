# Channels Desktop Feature Plan

## Status

- Phase: Implemented
- Branch: `feature/channels-desktop-layout`
- Scope: `/channels` desktop-first channel browser with selected-channel schedule

## Implementation Summary (2026-03-08)

Implemented in `apps/web`:

- New server API routes:
  - `GET /api/channels` for sorted enabled channels
  - `GET /api/events?channel=<uuid>&from=<now|ts>&limit=<N>` for `current` + `upcoming`
- Typed service access via `@tvh-guide/epg-cache-client` (no raw upstream URL calls in new channels APIs)
- Env-driven upcoming limit:
  - `CHANNELS_UPCOMING_LIMIT` in `.env.example`
  - fallback default `5` when missing/invalid
  - channels page load passes resolved limit to `/api/events`
- New channels UI components:
  - `ChannelListItem`, `ChannelList`, `ChannelDetailsPanel`
- Desktop behavior:
  - split layout with independent scrolling left/right panes
  - right pane shows channel identity, current event details, and upcoming list
- Mobile/iPhone behavior:
  - channel list in its own scroll container
  - persistent bottom section showing current event with event image preview
- Reused and extended now components:
  - `NowEventCard` adds `showLogo` and `showProgress` toggles
  - `NowEventDetailsPanel` adds widescreen side-image mode for channels panel
- Storybook updates:
  - new stories for all channels components
  - updated `NowEventCard` and `NowEventDetailsPanel` stories for new variants

## Functional Goal

Build a desktop-first channels screen with a side-by-side layout:

- Left: vertical list of all channels (number, logo, name), sorted by channel number
- Right: selected channel overview with:
  - large channel logo + name
  - currently running event with rich details
  - upcoming `N` shows with the same visual language as event cards, but without channel logo

Mobile behavior for v1:

- Only show the channel list (no right detail panel)

No paging in v1 for the channel list.

## API Design

### Why `GET /api/events`

The channels page should not own schedule-query logic directly.

`GET /api/events` acts as a reusable schedule query endpoint:

- Works for channels page now
- Can be reused by future views with different limits or timestamps
- Keeps UI components independent from upstream EPG cache query details

### Data Access Rule (Required)

The web app must query epg-cache through its typed client package, not by hand-crafted upstream URLs.

- Use `@tvh-guide/epg-cache-client` in web server code (`+page.server.ts`, `+server.ts`).
- Keep request/response mapping inside the web API/load layer, not in UI components.
- This ensures a single typed contract and avoids drift from epg-cache API definitions.

### Endpoint Contract (web app API)

`GET /api/events`

Query params:

- `channel` (required): selected channel UUID
- `from` (optional):
  - `now` (default)
  - unix timestamp in seconds (future extension support)
- `limit` (optional): number of upcoming events to return

Behavior:

- Resolve effective timestamp (`from=now` -> current unix seconds)
- Resolve effective limit:
  - use request `limit` if valid
  - otherwise fallback to server default (`5`)
- Fetch selected-channel events from epg-cache via `/api/events/timerange`
- Return normalized payload for `current` + `upcoming`

Implementation note:

- Web `GET /api/events` uses epg-cache client methods.
- If `getEventsByTimerange()` cannot produce current+upcoming efficiently with small bounded queries,
  extend epg-cache service and client with a dedicated lineup API.

### Response Shape (proposed)

```ts
interface ChannelEventsResponse {
  fromTs: number;
  current: NowEventItem | null;
  upcoming: NowEventItem[]; // max = effective limit
  meta: {
    requestedLimit: number | null;
    effectiveLimit: number;
    source: 'epg-cache';
  };
}
```

`NowEventItem` is the existing shared item model already used by now-view components.

## Logical Function Of `/api/events`

1. Validate query params (`channel`, `from`, `limit`).
2. Determine `fromTs`:
   - `from=now` or omitted -> current timestamp
   - numeric string -> parsed timestamp
3. Determine effective `limit`:
   - valid query `limit` wins
   - otherwise default `5`
4. Query epg-cache for selected channel in a future-inclusive time window.
5. Normalize events to `NowEventItem`.
6. Split result into:
   - `current`: event where `start <= fromTs < stop` (if any)
   - `upcoming`: events with `start > fromTs`, up to `effectiveLimit`
7. Return stable response structure for the UI.

This keeps one generic event endpoint while allowing each consumer to pass a fit-for-purpose `limit`.

## EPG Cache Efficiency Plan

Primary option (first attempt):

- Use existing epg-cache timerange endpoint through client with bounded query strategy.
- Keep query window and result size bounded (`limit` based).

Fallback option (if profiling/review shows inefficiency or complexity):

- Add dedicated epg-cache endpoint:
  - `GET /api/events/lineup?channel=<uuid|number>&from=<ts>&limit=<N>`
  - returns `current` + next `N` upcoming in one call
- Implement optimized store query for per-channel lineup.
- Add matching method in `@tvh-guide/epg-cache-client`.
- Consume this new typed client method from web `GET /api/events`.

This satisfies the requirement to adjust the epg-cache service when existing APIs are not sufficient or not efficient.

## Upcoming Limit Config

### Configuration

Add to `apps/web/.env.example`:

```bash
CHANNELS_UPCOMING_LIMIT=5
```

### Resolution Strategy

- Channels page server load reads `CHANNELS_UPCOMING_LIMIT`
- Validates integer > 0
- Falls back to `5` if missing/invalid
- Calls `/api/events?channel=<uuid>&from=now&limit=<resolvedLimit>`

### Why this split is useful

- Page decides its own UX default (desktop channels might use 5)
- API remains generic and reusable for future use cases with different limits
- Future pages can pass another limit without changing endpoint behavior

## UI Architecture

### Route

- `apps/web/src/routes/channels/+page.server.ts`
- `apps/web/src/routes/channels/+page.svelte`

### Components (planned)

- `apps/web/src/lib/components/channels/ChannelListItem.svelte`
- `apps/web/src/lib/components/channels/ChannelList.svelte`
- `apps/web/src/lib/components/channels/ChannelDetailsPanel.svelte`

### Existing Components Reused

- `apps/web/src/lib/components/common/ChannelLogo.svelte`
- `apps/web/src/lib/components/now/NowEventDetailsPanel.svelte` (for current event)
- `apps/web/src/lib/components/now/NowEventCard.svelte` (for upcoming events)

### Existing Component Change

- `apps/web/src/lib/components/now/NowEventCard.svelte`
  - add prop: `showLogo?: boolean` (default `true`)
  - upcoming list uses `showLogo={false}`

## Storybook Scope

Per project rule, add/update stories for each new/changed UI component.

New:

- `ChannelListItem.stories.svelte`
- `ChannelList.stories.svelte`
- `ChannelDetailsPanel.stories.svelte`

Updated:

- `NowEventCard.stories.svelte`
  - add a `NoLogo` variant

## Implementation Phases

1. Create branch `feature/channels-desktop-layout`
2. Add env default example (`CHANNELS_UPCOMING_LIMIT=5`)
3. Add `@tvh-guide/epg-cache-client` as web dependency and wire client creation in web server layer
4. Implement `GET /api/channels` using epg-cache client (typed contract)
5. Implement `GET /api/events` using epg-cache client with the contract above
6. Evaluate efficiency of current+upcoming query path
   - if needed, add epg-cache `lineup` API + store query + client method
7. Implement channels page server load:
   - channel list fetch
   - selected channel resolution
   - schedule fetch via `/api/events` with computed limit
8. Implement desktop/mobile channels UI
9. Add/update Storybook stories
10. Run: `pnpm --filter @tvh-guide/web check`
11. Manual QA on desktop and mobile breakpoints

## Acceptance Criteria

- Desktop `/channels` renders split view with selectable channel list
- Channel list sorted by number, no paging
- Selecting a channel updates right panel with:
  - channel identity
  - current event details
  - upcoming `N` events in card style without logo
- Mobile `/channels` shows only channel list
- Upcoming count configurable via env, defaulting to 5
- Storybook reflects all new/changed components
