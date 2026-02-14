# @tvh-guide/tvheadend-client

Type-safe TypeScript client for the TVHeadend API.

## Features

- ✅ **Type-safe** - Complete TypeScript type definitions for all API endpoints
- ✅ **Comprehensive** - Supports all 53 documented TVHeadend API endpoints
- ✅ **Well-tested** - 80%+ test coverage with comprehensive unit tests
- ✅ **Modern** - Built with ES2022, ESM modules, and modern tooling
- ✅ **Developer-friendly** - JSDoc documentation and IntelliSense support
- ✅ **Error handling** - Custom error classes for different HTTP status codes

## Installation

```bash
# Using pnpm (recommended)
pnpm add @tvh-guide/tvheadend-client

# Using npm
npm install @tvh-guide/tvheadend-client

# Using yarn
yarn add @tvh-guide/tvheadend-client
```

## Quick Start

```typescript
import { TVHeadendClient } from '@tvh-guide/tvheadend-client';

// Create a client instance
const client = new TVHeadendClient({
  baseUrl: 'http://localhost:9981',
  username: 'admin',
  password: 'secret',
});

// Get current EPG events
const events = await client.getEpgEventsGrid({ mode: 'now', limit: 10 });
console.log(`Found ${events.total} events`);

// Schedule a recording from an EPG event
const recording = await client.createDvrEntryByEvent({ event_id: 123456 });
console.log(`Scheduled recording: ${recording.title}`);

// List all channels sorted by number
const channels = await client.getChannelGrid({ sort: 'number', dir: 'ASC' });
console.log(`Found ${channels.total} channels`);
```

## Authentication

The client uses HTTP Basic Authentication. Credentials are automatically encoded and included in all API requests:

```typescript
const client = new TVHeadendClient({
  baseUrl: 'http://your-tvheadend-server:9981',
  username: 'your-username',
  password: 'your-password',
  timeout: 5000, // Optional: request timeout in milliseconds
});
```

## API Documentation

### EPG (Electronic Program Guide) - 6 endpoints

```typescript
// Get EPG events with filtering
const events = await client.getEpgEventsGrid({
  mode: 'now',
  limit: 50,
  channelTag: 'tag-uuid',
  contentType: 16,
});

// Load detailed event information
const eventDetails = await client.loadEpgEvents([123456, 123457]);

// List available content types (genres)
const contentTypes = await client.listContentTypes();

// Get alternative broadcasts of the same program
const alternatives = await client.getAlternativeEvents(123456);

// Get related events (e.g., other episodes)
const related = await client.getRelatedEvents(123456);
```

### Channels - 10 endpoints

```typescript
// Get channels with pagination
const channels = await client.getChannelGrid({
  start: 0,
  limit: 50,
  sort: 'number',
  dir: 'ASC',
});

// Get simple channel list
const channelList = await client.getChannelList();

// Create a new channel
const newChannel = await client.createChannel({
  name: 'My Channel',
  enabled: true,
  number: 999,
});

// Manage channel tags
const tags = await client.getChannelTagGrid();
const newTag = await client.createChannelTag({
  name: 'HD Channels',
  enabled: true,
});

// List channel categories
const categories = await client.listChannelCategories();
```

### DVR (Digital Video Recorder) - 23 endpoints

```typescript
// Get recordings
const recordings = await client.getDvrEntryGrid({ limit: 50 });
const upcoming = await client.getDvrEntryGridUpcoming();
const finished = await client.getDvrEntryGridFinished();
const failed = await client.getDvrEntryGridFailed();

// Create a manual recording
const manualRecording = await client.createDvrEntry({
  channel: 'channel-uuid',
  start: 1704067200,
  stop: 1704070800,
  title: 'My Recording',
  pri: 2,
});

// Schedule recording from EPG event
const eventRecording = await client.createDvrEntryByEvent({
  event_id: 123456,
  config_uuid: 'config-uuid', // Optional DVR config UUID
  pri: 2, // Optional priority (0=important, 6=unimportant)
  config_name: 'HDTV', // Optional DVR config profile name
});

// Recording lifecycle management
await client.cancelDvrEntry({ uuid: 'dvr-uuid' }); // Cancel scheduled
await client.stopDvrEntry({ uuid: 'dvr-uuid' }); // Stop active
await client.removeDvrEntry({ uuid: 'dvr-uuid' }); // Remove/delete

// Auto-recording rules
const autorecs = await client.getDvrAutorecGrid();
const newAutorec = await client.createDvrAutorec({
  name: 'Record All News',
  title: 'News',
  fulltext: true,
  pri: 2,
});

// Create autorec from series
const seriesAutorec = await client.createAutorecBySeries(123456);

// Time-based recordings
const timerecs = await client.getDvrTimerecGrid();

// DVR configuration profiles
const dvrConfigs = await client.getDvrConfigGrid();
const newConfig = await client.createDvrConfig({
  name: 'Custom Profile',
  enabled: true,
  retention_days: 30,
});
```

### Configuration - 5 endpoints

```typescript
// Load configuration tree
const config = await client.loadConfig();
const specificNode = await client.loadConfig('node-uuid');

// Save configuration changes
await client.saveConfig({
  node: 'node-uuid',
  conf: {
    setting1: 'value1',
    setting2: 'value2',
  },
});

// Get server information
const serverInfo = await client.getServerInfo();
console.log(`Server: ${serverInfo.name}`);
console.log(`Version: ${serverInfo.version}`);
console.log(`API Version: ${serverInfo.api_version}`);

// Get server capabilities
const capabilities = await client.getServerCapabilities();
console.log('Capabilities:', capabilities.entries);
```

### Status & Monitoring - 9 endpoints

```typescript
// Monitor connections
const connections = await client.getConnections();
console.log(`Active connections: ${connections.entries.length}`);

// Monitor subscriptions (active streams)
const subscriptions = await client.getSubscriptions();
console.log(`Active subscriptions: ${subscriptions.entries.length}`);

// Get server activity status (for power management)
const activity = await client.getActivity();
console.log(`Server activity: ${activity.entries[0].activity}`);

// Get input/adapter status
const inputs = await client.getInputs();
inputs.entries.forEach((input) => {
  console.log(`${input.name}: Signal ${input.signal}%, SNR ${input.snr}%`);
});

// Clear input statistics
await client.clearInputStats(); // All inputs
await client.clearInputStats({ uuid: 'input-uuid' }); // Specific input

// Cancel a connection
await client.cancelConnection({ id: 123 });

// Get service status
const services = await client.getServiceGrid();

// Get system logs
const logs = await client.getLog({
  limit: 100,
  level: 'ERROR',
});
```

## Error Handling

The client provides specific error classes for different HTTP status codes:

```typescript
import {
  TVHeadendClient,
  TVHeadendError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  BadRequestError,
  NetworkError,
} from '@tvh-guide/tvheadend-client';

try {
  const events = await client.getEpgEventsGrid({ limit: 10 });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid credentials');
  } else if (error instanceof AuthorizationError) {
    console.error('Permission denied');
  } else if (error instanceof NotFoundError) {
    console.error('Resource not found');
  } else if (error instanceof BadRequestError) {
    console.error('Invalid request parameters');
  } else if (error instanceof NetworkError) {
    console.error('Network connection failed:', error.cause);
  } else if (error instanceof TVHeadendError) {
    console.error(`TVHeadend error (${error.statusCode}):`, error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Types

The library exports comprehensive TypeScript types for all API entities:

```typescript
import type {
  // Grid/filter building blocks
  GridParams,
  GridResponse,
  FilterCondition,
  // EPG types
  EpgEvent,
  EpgEventDetail,
  EpgGridParams,
  EpgGridResponse,
  // Channel types
  Channel,
  ChannelTag,
  // DVR types
  DvrEntry,
  DvrEntryByEventParams,
  DvrAutorecEntry,
  DvrConfig,
  // Server/status types
  ServerInfo,
  ConnectionStatus,
  SubscriptionStatus,
  // ... and many more
} from '@tvh-guide/tvheadend-client';

// Use types for function parameters
async function processEvent(event: EpgEvent) {
  console.log(`Event: ${event.title}`);
  console.log(`Channel: ${event.channelName} (${event.channelNumber})`);
  console.log(`Start: ${new Date(event.start * 1000).toISOString()}`);
}

// Use types for response handling
const response: EpgGridResponse = await client.getEpgEventsGrid({ limit: 10 });
response.entries.forEach(processEvent);
```

## Grid Responses

Most list endpoints return paginated "grid" responses with a consistent structure:

```typescript
interface GridResponse<T> {
  entries: T[]; // Array of items
  total: number; // Total number of items (before pagination)
  start: number; // Starting offset
  limit: number; // Maximum items per page
}

// Use pagination
const page1 = await client.getChannelGrid({ start: 0, limit: 50 });
const page2 = await client.getChannelGrid({ start: 50, limit: 50 });

console.log(`Showing ${page1.entries.length} of ${page1.total} total channels`);
```

## Filtering and Sorting

Many grid endpoints support filtering and sorting:

```typescript
import type { FilterCondition } from '@tvh-guide/tvheadend-client';

// Sort by field
const channels = await client.getChannelGrid({
  sort: 'number',
  dir: 'ASC',
});

// Filter by status
const activeRecordings = await client.getDvrEntryGrid({
  status: 'recording',
});

// Typed filter using FilterCondition (recommended)
const hdChannels = await client.getChannelGrid({
  filter: { field: 'name', type: 'string', value: 'HD' },
});

// Multiple filter conditions (AND logic)
const filters: FilterCondition[] = [
  { field: 'title', type: 'string', comparison: 'regex', value: 'News' },
  { field: 'start', type: 'numeric', comparison: 'gt', value: Math.floor(Date.now() / 1000) },
];
const events = await client.getEpgEventsGrid({ filter: filters });

// String filter also supported (pre-serialized JSON)
const results = await client.getChannelGrid({
  filter: JSON.stringify({ field: 'name', type: 'string', value: 'HD' }),
});
```

## Development

### Building

```bash
pnpm build
```

Builds the library to `dist/` with ESM output and TypeScript declarations.

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Type Checking

```bash
pnpm exec tsc --noEmit
```

## Requirements

- Node.js 18+ or compatible runtime
- TypeScript 5.0+ (for development)

## License

MIT

## Contributing

Contributions are welcome! Please ensure:

1. All tests pass: `pnpm test`
2. Code coverage remains above 80%: `pnpm test:coverage`
3. TypeScript types are properly defined
4. JSDoc comments are added for public APIs
5. Follow existing code style and conventions

## Related

This library is part of the [TVH Guide NG](https://github.com/yourusername/tvh-guide-ng) monorepo, a modern Electronic Program Guide (EPG) application for TVHeadend.

## Support

For issues and questions:

- GitHub Issues: [Report a bug or request a feature](https://github.com/yourusername/tvh-guide-ng/issues)
- TVHeadend Documentation: [Official API Documentation](https://tvheadend.org/)

## Changelog

### 0.1.0

- Initial release
- Support for all 53 documented TVHeadend API endpoints
- Comprehensive TypeScript types
- 80%+ test coverage
- Full JSDoc documentation
