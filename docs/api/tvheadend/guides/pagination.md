# Pagination Guide

This guide explains how to paginate through large datasets using TVHeadend's grid pattern.

## Overview

Most TVHeadend API endpoints that return lists use a consistent "grid" response pattern with built-in pagination support. Over 50 endpoints use this pattern, including:

- `/api/epg/events/grid` - EPG events
- `/api/channel/grid` - Channels
- `/api/dvr/entry/grid` - DVR recordings
- `/api/service/grid` - Services
- And many more...

## Grid Response Structure

All grid endpoints return responses in this format:

```json
{
  "entries": [...],  // Array of data items
  "total": 142,      // Total number of items matching query
  "start": 0,        // Starting offset (optional)
  "limit": 50        // Page size (optional)
}
```

**Key fields:**

- `entries` - Current page of results
- `total` - Total count across all pages (for pagination UI)
- `start` - Echo of the start parameter
- `limit` - Echo of the limit parameter

## Basic Pagination

### Query Parameters

| Parameter | Type    | Default | Description                  |
| --------- | ------- | ------- | ---------------------------- |
| `start`   | integer | 0       | Starting offset (0-based)    |
| `limit`   | integer | 50      | Maximum items per page       |
| `sort`    | string  | -       | Field name to sort by        |
| `dir`     | string  | ASC     | Sort direction (ASC or DESC) |

### Example: First Page

**Request:**

```bash
curl -u user:pass \
  'http://localhost:9981/api/channel/grid?start=0&limit=50'
```

**Response:**

```json
{
  "entries": [
    {"uuid": "ch1", "name": "BBC One HD", "number": 101},
    {"uuid": "ch2", "name": "BBC Two HD", "number": 102},
    ...
  ],
  "total": 142
}
```

**Interpretation:**

- Got first 50 channels (entries 0-49)
- Total of 142 channels exist
- Need 3 pages to see all (142 ÷ 50 = 2.84 → 3 pages)

### Example: Second Page

**Request:**

```bash
curl -u user:pass \
  'http://localhost:9981/api/channel/grid?start=50&limit=50'
```

**Response:**

```json
{
  "entries": [
    {"uuid": "ch51", "name": "ITV HD", "number": 151},
    ...
  ],
  "total": 142
}
```

**Interpretation:**

- Got entries 50-99 (second page)
- Still 142 total

### Example: Last Page

**Request:**

```bash
curl -u user:pass \
  'http://localhost:9981/api/channel/grid?start=100&limit=50'
```

**Response:**

```json
{
  "entries": [
    {"uuid": "ch101", "name": "Film4 HD", "number": 201},
    ...
  ],
  "total": 142
}
```

**Interpretation:**

- Got entries 100-141 (last 42 items)
- `entries.length` will be 42, not 50

## Get All Results

### Option 1: Set limit=0

**Request:**

```bash
curl -u user:pass \
  'http://localhost:9981/api/channel/grid?limit=0'
```

**Response:**

```json
{
  "entries": [...],  // All 142 channels
  "total": 142
}
```

**Use when:**

- Dataset is small (<1000 items)
- You need all data at once
- Building local caches

**Warning:** Large datasets may cause timeout or memory issues.

### Option 2: Use `all=1` parameter

Some endpoints support the `all` parameter:

```bash
curl -u user:pass \
  'http://localhost:9981/api/channel/grid?all=1'
```

Equivalent to `limit=0`.

## Sorting

### Sort by Field

**Available sort fields vary by endpoint.** Common fields:

**Channels:**

- `number` - Channel number
- `name` - Channel name

**EPG:**

- `start` - Start time
- `stop` - End time
- `title` - Program title
- `channelname` - Channel name

**DVR:**

- `start` - Recording start
- `title` - Recording title
- `status` - Recording status
- `filesize` - File size

**Example: Sort channels by number:**

```bash
curl -u user:pass \
  'http://localhost:9981/api/channel/grid?sort=number&dir=ASC&limit=50'
```

**Example: Sort EPG by start time (newest first):**

```bash
curl -u user:pass \
  'http://localhost:9981/api/epg/events/grid?sort=start&dir=DESC&limit=50'
```

### Sort Direction

- `ASC` - Ascending (A→Z, 0→9, oldest→newest)
- `DESC` - Descending (Z→A, 9→0, newest→oldest)

**Default:** Usually `ASC` if not specified

## Pagination Patterns

### Pattern 1: Load All Pages Sequentially

**Use case:** Export all data, build complete cache

```python
import requests

def fetch_all_pages(endpoint, page_size=50):
    items = []
    start = 0

    while True:
        response = requests.get(
            f'http://localhost:9981{endpoint}',
            auth=('user', 'pass'),
            params={'start': start, 'limit': page_size}
        )
        data = response.json()

        items.extend(data['entries'])

        # Check if we've fetched everything
        if len(items) >= data['total']:
            break

        start += page_size

    return items

# Fetch all channels
all_channels = fetch_all_pages('/api/channel/grid')
print(f"Fetched {len(all_channels)} channels")
```

### Pattern 2: Infinite Scroll / Load More

**Use case:** UI with "load more" button or infinite scroll

```javascript
class TVHeadendClient {
  constructor(baseURL, auth) {
    this.baseURL = baseURL;
    this.auth = auth;
  }

  async fetchPage(endpoint, start, limit) {
    const url = `${this.baseURL}${endpoint}`;
    const params = new URLSearchParams({ start, limit });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        Authorization: `Basic ${btoa(`${this.auth.user}:${this.auth.pass}`)}`,
      },
    });

    return response.json();
  }

  async *paginateGrid(endpoint, pageSize = 50) {
    let start = 0;
    let total = Infinity;

    while (start < total) {
      const page = await this.fetchPage(endpoint, start, pageSize);
      total = page.total;

      yield {
        entries: page.entries,
        start,
        total,
        hasMore: start + pageSize < total,
      };

      start += pageSize;
    }
  }
}

// Usage
const client = new TVHeadendClient('http://localhost:9981', {
  user: 'api-user',
  pass: 'password',
});

for await (const page of client.paginateGrid('/api/channel/grid', 20)) {
  console.log(`Loaded ${page.entries.length} channels`);
  console.log(`Progress: ${page.start + page.entries.length}/${page.total}`);

  if (!page.hasMore) {
    console.log('All channels loaded!');
  }
}
```

### Pattern 3: Paginated Table UI

**Use case:** Data table with page buttons (1, 2, 3...)

```javascript
class PaginationHelper {
  constructor(totalItems, pageSize) {
    this.totalItems = totalItems;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(totalItems / pageSize);
  }

  getPageInfo(pageNumber) {
    // pageNumber is 1-based
    const start = (pageNumber - 1) * this.pageSize;
    const limit = this.pageSize;

    return {
      start,
      limit,
      pageNumber,
      totalPages: this.totalPages,
      isFirst: pageNumber === 1,
      isLast: pageNumber === this.totalPages,
    };
  }

  async fetchPage(endpoint, pageNumber) {
    const { start, limit } = this.getPageInfo(pageNumber);

    const response = await fetch(`http://localhost:9981${endpoint}?start=${start}&limit=${limit}`, {
      headers: {
        Authorization: 'Basic ' + btoa('user:pass'),
      },
    });

    return response.json();
  }
}

// Usage
const data = await client.fetchPage('/api/channel/grid', 1);
const pagination = new PaginationHelper(data.total, 50);

console.log(`Total pages: ${pagination.totalPages}`);

// Navigate to page 3
const page3Info = pagination.getPageInfo(3);
console.log(`Fetch start=${page3Info.start}, limit=${page3Info.limit}`);
```

### Pattern 4: Cursor-Based (Server-Sent)

**Note:** TVHeadend doesn't natively support cursor pagination, but you can simulate it:

```python
def fetch_with_cursor(last_start=0, page_size=50):
    """
    Fetch next page using last position as cursor
    """
    response = requests.get(
        'http://localhost:9981/api/channel/grid',
        auth=('user', 'pass'),
        params={'start': last_start, 'limit': page_size}
    )
    data = response.json()

    return {
        'items': data['entries'],
        'cursor': last_start + len(data['entries']),  # Next start position
        'has_more': last_start + len(data['entries']) < data['total']
    }

# Usage
cursor = 0
while True:
    page = fetch_with_cursor(cursor, 20)

    for item in page['items']:
        process_item(item)

    if not page['has_more']:
        break

    cursor = page['cursor']
```

## Performance Optimization

### 1. Choose Appropriate Page Size

**Small pages (10-20):**

- ✅ Fast response time
- ✅ Good for UI responsiveness
- ❌ More requests needed
- ❌ Higher overhead

**Medium pages (50-100):**

- ✅ Balanced approach
- ✅ Good for most use cases
- ✅ Default for many endpoints

**Large pages (500-1000):**

- ✅ Fewer requests
- ✅ Good for batch processing
- ❌ Slower response time
- ❌ May hit timeouts

**All at once (limit=0):**

- ✅ Single request
- ✅ Best for small datasets (<500 items)
- ❌ Can timeout on large datasets
- ❌ Memory intensive

**Recommendation:** Start with 50, adjust based on use case.

### 2. Use Sorting to Reduce Data

If you only need recent items, sort and limit:

```bash
# Get 50 most recent EPG events
curl -u user:pass \
  'http://localhost:9981/api/epg/events/grid?sort=start&dir=DESC&limit=50'
```

### 3. Combine with Filtering

Reduce total count by filtering before pagination:

```bash
# Only get HD channels, then paginate
curl -u user:pass \
  'http://localhost:9981/api/channel/grid?filter=HD&start=0&limit=50'
```

See [Filtering Guide](./filtering.md) for details.

### 4. Cache Total Count

The `total` field is consistent across pages. Cache it to avoid extra requests:

```javascript
let cachedTotal = null;

async function fetchPage(start, limit) {
  const data = await api.get('/api/channel/grid', { start, limit });

  if (cachedTotal === null) {
    cachedTotal = data.total;
    console.log(`Total channels: ${cachedTotal}`);
  }

  return data;
}
```

### 5. Parallel Page Fetching

For export/sync operations, fetch multiple pages concurrently:

```javascript
async function fetchAllChannelsParallel(pageSize = 100) {
  // First, get total count
  const firstPage = await fetchPage('/api/channel/grid', 0, pageSize);
  const total = firstPage.total;
  const totalPages = Math.ceil(total / pageSize);

  // Fetch remaining pages in parallel
  const pagePromises = [];
  for (let page = 1; page < totalPages; page++) {
    const start = page * pageSize;
    pagePromises.push(fetchPage('/api/channel/grid', start, pageSize));
  }

  const pages = await Promise.all(pagePromises);

  // Combine all results
  const allEntries = [...firstPage.entries, ...pages.flatMap((p) => p.entries)];

  return allEntries;
}
```

**Warning:** Use concurrency limits to avoid overwhelming the server.

## Common Pitfalls

### ❌ Not Checking Total

```javascript
// BAD: May miss items if total > limit
const data = await fetch('/api/channel/grid?limit=50');
const channels = data.entries; // Only first 50!
```

```javascript
// GOOD: Check if pagination needed
const data = await fetch('/api/channel/grid?limit=50');
if (data.total > data.entries.length) {
  console.log(`Warning: Only showing ${data.entries.length} of ${data.total}`);
}
```

### ❌ Off-by-One Errors

```javascript
// BAD: 1-based indexing
const page2 = await fetch('/api/channel/grid?start=1&limit=50'); // Wrong!
```

```javascript
// GOOD: 0-based indexing
const page2 = await fetch('/api/channel/grid?start=50&limit=50'); // Correct
```

### ❌ Infinite Loops

```javascript
// BAD: May loop forever
let start = 0;
while (true) {
  const data = await fetch(`/api/channel/grid?start=${start}&limit=50`);
  // Missing break condition!
  start += 50;
}
```

```javascript
// GOOD: Check against total
let start = 0;
let total = Infinity;
while (start < total) {
  const data = await fetch(`/api/channel/grid?start=${start}&limit=50`);
  total = data.total;
  start += 50;
}
```

### ❌ Ignoring Empty Results

```javascript
// BAD: Assumes entries always exist
const data = await fetch('/api/epg/events/grid');
const firstEvent = data.entries[0]; // May be undefined!
```

```javascript
// GOOD: Check for empty results
const data = await fetch('/api/epg/events/grid');
if (data.entries.length === 0) {
  console.log('No events found');
} else {
  const firstEvent = data.entries[0];
}
```

## Examples by Programming Language

### Python

```python
def paginate_grid(endpoint, page_size=50, max_items=None):
    """
    Generator that yields items from paginated endpoint.

    Args:
        endpoint: API endpoint path
        page_size: Items per page
        max_items: Optional limit on total items to fetch

    Yields:
        Individual items from the grid
    """
    start = 0
    items_fetched = 0

    while True:
        response = requests.get(
            f'http://localhost:9981{endpoint}',
            auth=('user', 'pass'),
            params={'start': start, 'limit': page_size}
        )
        data = response.json()

        for item in data['entries']:
            yield item
            items_fetched += 1

            if max_items and items_fetched >= max_items:
                return

        # Check if we're done
        if start + len(data['entries']) >= data['total']:
            break

        start += page_size

# Usage
for channel in paginate_grid('/api/channel/grid', page_size=20, max_items=100):
    print(f"{channel['number']}: {channel['name']}")
```

### Go

```go
type GridResponse struct {
    Entries []map[string]interface{} `json:"entries"`
    Total   int                      `json:"total"`
}

func fetchAllPages(endpoint string, pageSize int) ([]map[string]interface{}, error) {
    var allItems []map[string]interface{}
    start := 0

    client := &http.Client{}

    for {
        url := fmt.Sprintf("http://localhost:9981%s?start=%d&limit=%d",
            endpoint, start, pageSize)

        req, _ := http.NewRequest("GET", url, nil)
        req.SetBasicAuth("user", "pass")

        resp, err := client.Do(req)
        if err != nil {
            return nil, err
        }
        defer resp.Body.Close()

        var data GridResponse
        json.NewDecoder(resp.Body).Decode(&data)

        allItems = append(allItems, data.Entries...)

        if len(allItems) >= data.Total {
            break
        }

        start += pageSize
    }

    return allItems, nil
}
```

## Additional Resources

- [Filtering Guide](./filtering.md) - Combine pagination with filters
- [OpenAPI Specification](../openapi.yaml) - Full API reference
- [Grid Response Schema](../components/schemas/grid.yaml) - Grid structure details
