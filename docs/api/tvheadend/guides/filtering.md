# Filtering Guide

This guide explains how to filter results in TVHeadend API grid endpoints using the `filter` parameter.

## Overview

Most grid endpoints support filtering through a flexible `filter` query parameter. The filter supports three formats:

1. **Simple string search** - Search across multiple fields
2. **Single field filter** - Filter on specific field with operators
3. **Multiple filters** - Combine multiple conditions (AND logic)

## Filter Formats

### Format 1: Simple String Search

**Format:** `filter={searchString}`

**Searches:** Title, description, channel name, and other text fields

**Example:**
```bash
curl -u user:pass \
  'http://localhost:9981/api/epg/events/grid?filter=news'
```

**Matches events where:**
- Title contains "news", OR
- Description contains "news", OR
- Channel name contains "news"

**Use case:** Quick search box, user-entered queries

### Format 2: Single Field Filter

**Format:** `filter={JSON_object}`

**JSON structure:**
```json
{
  "field": "fieldName",
  "type": "string|numeric|boolean",
  "value": searchValue,
  "comparison": "eq|ne|gt|gte|lt|le|contains|starts|ends|regex"
}
```

**Example - Filter by channel name:**
```bash
curl -u user:pass -G \
  'http://localhost:9981/api/epg/events/grid' \
  --data-urlencode 'filter={"field":"channelname","type":"string","value":"BBC"}'
```

**Example - Filter by start time (after timestamp):**
```bash
curl -u user:pass -G \
  'http://localhost:9981/api/epg/events/grid' \
  --data-urlencode 'filter={"field":"start","type":"numeric","value":1704067200,"comparison":"gt"}'
```

### Format 3: Multiple Filters (AND Logic)

**Format:** `filter=[{filter1}, {filter2}, ...]`

**All conditions must match (AND logic)**

**Example - BBC channels AND after specific time:**
```bash
curl -u user:pass -G \
  'http://localhost:9981/api/epg/events/grid' \
  --data-urlencode 'filter=[
    {"field":"channelname","type":"string","value":"BBC"},
    {"field":"start","type":"numeric","value":1704067200,"comparison":"gte"}
  ]'
```

**Example - Movies longer than 90 minutes:**
```bash
curl -u user:pass -G \
  'http://localhost:9981/api/epg/events/grid' \
  --data-urlencode 'filter=[
    {"field":"contentType","type":"numeric","value":16,"comparison":"eq"},
    {"field":"duration","type":"numeric","value":5400,"comparison":"gte"}
  ]'
```

## Field Types

### String Type

**type:** `"string"`

**Comparison operators:**
- `contains` (default) - Substring match (case-insensitive)
- `starts` - Starts with
- `ends` - Ends with
- `eq` - Exact match
- `regex` - Regular expression match

**Examples:**
```bash
# Contains "documentary"
filter={"field":"title","type":"string","value":"documentary","comparison":"contains"}

# Starts with "BBC"
filter={"field":"channelname","type":"string","value":"BBC","comparison":"starts"}

# Ends with "HD"
filter={"field":"channelname","type":"string","value":"HD","comparison":"ends"}

# Exact match
filter={"field":"title","type":"string","value":"News at Ten","comparison":"eq"}

# Regex match (case-insensitive by default)
filter={"field":"title","type":"string","value":"news|documentary","comparison":"regex"}
```

### Numeric Type

**type:** `"numeric"`

**Comparison operators:**
- `eq` - Equal to
- `ne` - Not equal to
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `le` - Less than or equal

> **Note:** The TVHeadend API uses `le` (not `lte`) for "less than or equal". Some older documentation may reference `lte`, but `le` is the correct operator name.

**Examples:**
```bash
# Events starting after 2024-01-01 00:00:00
filter={"field":"start","type":"numeric","value":1704067200,"comparison":"gte"}

# Channel number is 101
filter={"field":"number","type":"numeric","value":101,"comparison":"eq"}

# Duration less than 30 minutes (1800 seconds)
filter={"field":"duration","type":"numeric","value":1800,"comparison":"lt"}

# File size greater than 1GB (1073741824 bytes)
filter={"field":"filesize","type":"numeric","value":1073741824,"comparison":"gt"}
```

### Boolean Type

**type:** `"boolean"`

**Values:** `0` (false) or `1` (true)

**Example:**
```bash
# HD programs only
filter={"field":"hd","type":"boolean","value":1}

# Enabled channels only
filter={"field":"enabled","type":"boolean","value":1}
```

## Using the TypeScript Client

The `@tvh-guide/tvheadend-client` library provides a typed `FilterCondition` interface for building filters without manual JSON serialization:

```typescript
import type { FilterCondition } from '@tvh-guide/tvheadend-client';

// Single filter
const events = await client.getEpgEventsGrid({
  filter: { field: 'title', type: 'string', comparison: 'regex', value: 'news' },
});

// Multiple filters (AND logic)
const filters: FilterCondition[] = [
  { field: 'channelname', type: 'string', value: 'BBC' },
  { field: 'start', type: 'numeric', comparison: 'gte', value: 1704067200 },
];
const results = await client.getEpgEventsGrid({ filter: filters });
```

The `FilterCondition.comparison` type supports: `eq`, `ne`, `lt`, `le`, `gt`, `gte`, and `regex`. The string-specific comparisons (`contains`, `starts`, `ends`) used by the raw API can be passed via pre-serialized JSON strings instead.

## Common Filtering Scenarios

### EPG Filtering

#### Filter by Channel

**Single channel:**
```bash
# Using dedicated channel parameter
curl -u user:pass \
  'http://localhost:9981/api/epg/events/grid?channel=channel-uuid-123'
```

**Multiple channels:**
```bash
# Comma-separated UUIDs
curl -u user:pass \
  'http://localhost:9981/api/epg/events/grid?channel=uuid1,uuid2,uuid3'
```

#### Filter by Time Range

**Programs between two times:**
```bash
START_TIME=1704067200  # 2024-01-01 00:00:00
END_TIME=1704153600    # 2024-01-02 00:00:00

curl -u user:pass -G \
  'http://localhost:9981/api/epg/events/grid' \
  --data-urlencode "filter=[
    {\"field\":\"start\",\"type\":\"numeric\",\"value\":$START_TIME,\"comparison\":\"gte\"},
    {\"field\":\"stop\",\"type\":\"numeric\",\"value\":$END_TIME,\"comparison\":\"le\"}
  ]"
```

#### Filter by Content Type

**Movies only (content type 0x10 = 16):**
```bash
curl -u user:pass -G \
  'http://localhost:9981/api/epg/events/grid' \
  --data-urlencode 'filter={"field":"contentType","type":"numeric","value":16}'

# Or use dedicated parameter
curl -u user:pass \
  'http://localhost:9981/api/epg/events/grid?contentType=16'
```

**Common content types:**
- `16` (0x10) - Movie/Drama
- `32` (0x20) - News/Current affairs
- `48` (0x30) - Show/Game show
- `64` (0x40) - Sports
- `80` (0x50) - Children's/Youth
- `96` (0x60) - Music/Ballet/Dance

#### Filter by Duration

**Long-form content (>90 minutes):**
```bash
curl -u user:pass -G \
  'http://localhost:9981/api/epg/events/grid' \
  --data-urlencode 'filter={"field":"duration","type":"numeric","value":5400,"comparison":"gte"}'

# Or use dedicated parameter
curl -u user:pass \
  'http://localhost:9981/api/epg/events/grid?duration=5400'
```

#### Full-Text Search

Enable search across all text fields:

```bash
curl -u user:pass \
  'http://localhost:9981/api/epg/events/grid?filter=documentary&fulltext=1'
```

### Channel Filtering

#### Filter by Tag

**Channels with specific tag:**
```bash
curl -u user:pass \
  'http://localhost:9981/api/channel/grid?tags=tag-uuid-hd'
```

#### Filter by Name

**BBC channels:**
```bash
curl -u user:pass -G \
  'http://localhost:9981/api/channel/grid' \
  --data-urlencode 'filter={"field":"name","type":"string","value":"BBC"}'
```

#### Filter by Number Range

**Channels 100-199:**
```bash
curl -u user:pass -G \
  'http://localhost:9981/api/channel/grid' \
  --data-urlencode 'filter=[
    {"field":"number","type":"numeric","value":100,"comparison":"gte"},
    {"field":"number","type":"numeric","value":200,"comparison":"lt"}
  ]'
```

### DVR Filtering

#### Filter by Status

**Completed recordings only:**
```bash
curl -u user:pass -G \
  'http://localhost:9981/api/dvr/entry/grid' \
  --data-urlencode 'filter={"field":"status","type":"string","value":"completed"}'

# Or use dedicated parameter
curl -u user:pass \
  'http://localhost:9981/api/dvr/entry/grid?status=completed'
```

**Scheduled recordings:**
```bash
curl -u user:pass \
  'http://localhost:9981/api/dvr/entry/grid?status=scheduled'
```

#### Filter by Channel

**Recordings from specific channel:**
```bash
curl -u user:pass -G \
  'http://localhost:9981/api/dvr/entry/grid' \
  --data-urlencode 'filter={"field":"channelname","type":"string","value":"BBC One"}'
```

#### Filter by Date Range

**Recordings from last 7 days:**
```bash
WEEK_AGO=$(date -d '7 days ago' +%s)

curl -u user:pass -G \
  'http://localhost:9981/api/dvr/entry/grid' \
  --data-urlencode "filter={\"field\":\"start\",\"type\":\"numeric\",\"value\":$WEEK_AGO,\"comparison\":\"gte\"}"
```

## Combining Filters with Pagination

Filters reduce the result set, then pagination applies:

```bash
# Get HD movies airing tonight, first page
curl -u user:pass -G \
  'http://localhost:9981/api/epg/events/grid' \
  --data-urlencode 'filter=[
    {"field":"contentType","type":"numeric","value":16},
    {"field":"hd","type":"boolean","value":1},
    {"field":"start","type":"numeric","value":1704067200,"comparison":"gte"},
    {"field":"stop","type":"numeric","value":1704153600,"comparison":"le"}
  ]' \
  --data-urlencode 'start=0' \
  --data-urlencode 'limit=50'
```

**Response:**
```json
{
  "entries": [...],
  "total": 23  // Only 23 items match filters
}
```

The `total` field reflects filtered count, not total dataset size.

## URL Encoding

Filter parameters must be URL-encoded, especially JSON structures.

### Using curl

**Option 1: `--data-urlencode` (recommended):**
```bash
curl -u user:pass -G \
  'http://localhost:9981/api/epg/events/grid' \
  --data-urlencode 'filter={"field":"title","type":"string","value":"news"}'
```

**Option 2: Manual encoding:**
```bash
FILTER='{"field":"title","type":"string","value":"news"}'
ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$FILTER'))")

curl -u user:pass \
  "http://localhost:9981/api/epg/events/grid?filter=$ENCODED"
```

### Using JavaScript

```javascript
const filter = {
  field: 'title',
  type: 'string',
  value: 'news'
};

const params = new URLSearchParams({
  filter: JSON.stringify(filter)
});

const url = `http://localhost:9981/api/epg/events/grid?${params}`;
```

### Using Python

```python
import requests
import json

filter_obj = {
    'field': 'title',
    'type': 'string',
    'value': 'news'
}

response = requests.get(
    'http://localhost:9981/api/epg/events/grid',
    auth=('user', 'pass'),
    params={'filter': json.dumps(filter_obj)}
)
```

## Filter Builder Helper

### Python

```python
class FilterBuilder:
    def __init__(self):
        self.filters = []

    def add_string(self, field, value, comparison='contains'):
        self.filters.append({
            'field': field,
            'type': 'string',
            'value': value,
            'comparison': comparison
        })
        return self

    def add_numeric(self, field, value, comparison='eq'):
        self.filters.append({
            'field': field,
            'type': 'numeric',
            'value': value,
            'comparison': comparison
        })
        return self

    def add_boolean(self, field, value):
        self.filters.append({
            'field': field,
            'type': 'boolean',
            'value': 1 if value else 0
        })
        return self

    def build(self):
        if len(self.filters) == 0:
            return None
        elif len(self.filters) == 1:
            return self.filters[0]
        else:
            return self.filters

# Usage
filter_obj = (FilterBuilder()
    .add_string('channelname', 'BBC')
    .add_numeric('start', 1704067200, 'gte')
    .add_boolean('hd', True)
    .build())

response = requests.get(
    'http://localhost:9981/api/epg/events/grid',
    auth=('user', 'pass'),
    params={'filter': json.dumps(filter_obj)}
)
```

### JavaScript

```javascript
class FilterBuilder {
  constructor() {
    this.filters = [];
  }

  addString(field, value, comparison = 'contains') {
    this.filters.push({
      field,
      type: 'string',
      value,
      comparison
    });
    return this;
  }

  addNumeric(field, value, comparison = 'eq') {
    this.filters.push({
      field,
      type: 'numeric',
      value,
      comparison
    });
    return this;
  }

  addBoolean(field, value) {
    this.filters.push({
      field,
      type: 'boolean',
      value: value ? 1 : 0
    });
    return this;
  }

  build() {
    if (this.filters.length === 0) return null;
    if (this.filters.length === 1) return this.filters[0];
    return this.filters;
  }
}

// Usage
const filter = new FilterBuilder()
  .addString('channelname', 'BBC')
  .addNumeric('start', 1704067200, 'gte')
  .addBoolean('hd', true)
  .build();

const params = new URLSearchParams({
  filter: JSON.stringify(filter)
});

const response = await fetch(
  `http://localhost:9981/api/epg/events/grid?${params}`,
  {
    headers: {
      'Authorization': 'Basic ' + btoa('user:pass')
    }
  }
);
```

## Common Pitfalls

### ❌ Forgetting URL Encoding

```bash
# BAD: Unencoded JSON will fail
curl 'http://localhost:9981/api/epg/events/grid?filter={"field":"title","value":"news"}'
```

```bash
# GOOD: Use --data-urlencode
curl -G 'http://localhost:9981/api/epg/events/grid' \
  --data-urlencode 'filter={"field":"title","value":"news"}'
```

### ❌ Wrong Field Names

```bash
# BAD: Field names are case-sensitive
filter={"field":"Title","value":"news"}  # Wrong!
```

```bash
# GOOD: Use exact field names from schema
filter={"field":"title","value":"news"}  # Correct
```

**Tip:** Check OpenAPI schema for exact field names.

### ❌ Type Mismatch

```bash
# BAD: Using string type for numeric field
filter={"field":"start","type":"string","value":"1704067200"}  # Wrong!
```

```bash
# GOOD: Use numeric type for timestamps/numbers
filter={"field":"start","type":"numeric","value":1704067200}  # Correct
```

### ❌ Missing Comparison Operator

```bash
# Ambiguous: Might default to 'contains' for strings
filter={"field":"channelname","type":"string","value":"BBC"}
```

```bash
# Better: Be explicit
filter={"field":"channelname","type":"string","value":"BBC","comparison":"contains"}
```

## Performance Tips

### 1. Use Specific Fields Instead of Full-Text

```bash
# SLOW: Full-text search
filter=news&fulltext=1
```

```bash
# FASTER: Specific field search
filter={"field":"title","type":"string","value":"news"}
```

### 2. Limit Time Ranges for EPG

```bash
# SLOW: All future events
filter={"field":"start","type":"numeric","value":1704067200,"comparison":"gte"}
```

```bash
# FASTER: Bounded time range
filter=[
  {"field":"start","type":"numeric","value":1704067200,"comparison":"gte"},
  {"field":"stop","type":"numeric","value":1704153600,"comparison":"le"}
]
```

### 3. Combine with Channel Filter

```bash
# FASTER: Filter by channel first
channel=uuid1,uuid2,uuid3&filter={"field":"title","value":"news"}
```

Reduces dataset before applying text search.

### 4. Use Indexes Fields

Fields likely indexed (faster):
- `uuid`
- `channelUuid` / `channel`
- `start` / `stop` (timestamps)
- `number` (channel number)
- `status` (DVR status)

## Troubleshooting

### No Results Returned

**Check:**
1. Filter syntax is valid JSON
2. Field names match schema exactly
3. Values are correct type
4. Comparison operator is appropriate

**Debug:**
```bash
# Remove filters to see if data exists
curl -u user:pass 'http://localhost:9981/api/epg/events/grid?limit=10'

# Add filters one at a time
curl -u user:pass 'http://localhost:9981/api/epg/events/grid?limit=10&filter={"field":"channelname","type":"string","value":"BBC"}'
```

### HTTP 400 Bad Request

**Cause:** Malformed filter parameter

**Solution:**
1. Validate JSON syntax
2. Check URL encoding
3. Verify field names
4. Check value types

### Unexpected Results

**Cause:** Case-insensitive matching or partial matches

**Example:**
```bash
# Searching for "BBC" might match:
# - "BBC One"
# - "BBC Two"
# - "bbcnews" (no space)
```

**Solution:** Use more specific values or `eq` comparison:
```bash
filter={"field":"channelname","type":"string","value":"BBC One","comparison":"eq"}
```

## Additional Resources

- [Pagination Guide](./pagination.md) - Combine filtering with pagination
- [OpenAPI Specification](../openapi.yaml) - Field names and types
- [Filter Parameter Schema](../components/parameters/filter.yaml) - Detailed filter spec
