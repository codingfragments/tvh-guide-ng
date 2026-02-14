# Use Case: List and Display Channels

This walkthrough demonstrates how to retrieve and display TV channels from TVHeadend.

## Scenario

You're building an EPG web application and need to display a list of available TV channels for users to browse.

## Requirements

- Display channels sorted by channel number
- Show channel name, number, and icon
- Filter to show only enabled channels
- Support pagination for large channel lists

## Implementation Steps

### Step 1: Fetch Channels

**Request:**

```http
GET /api/channel/grid?sort=number&dir=ASC&limit=50&start=0
Authorization: Basic dXNlcjpwYXNz
```

**Parameters:**

- `sort=number` - Sort by channel number
- `dir=ASC` - Ascending order (1, 2, 3...)
- `limit=50` - 50 channels per page
- `start=0` - First page

**Response:**

```json
{
  "entries": [
    {
      "uuid": "1a2b3c4d...",
      "number": 101,
      "name": "BBC One HD",
      "icon": "imagecache/1",
      "iconPublicUrl": "http://localhost:9981/imagecache/1",
      "enabled": true,
      "tags": ["hd-tag-uuid"]
    },
    {
      "uuid": "2b3c4d5e...",
      "number": 102,
      "name": "BBC Two HD",
      "icon": "imagecache/2",
      "iconPublicUrl": "http://localhost:9981/imagecache/2",
      "enabled": true,
      "tags": ["hd-tag-uuid"]
    }
  ],
  "total": 142
}
```

### Step 2: Filter Enabled Channels Only

**Request with filter:**

```http
GET /api/channel/grid?sort=number&dir=ASC&limit=50&start=0&filter={"field":"enabled","type":"boolean","value":1}
Authorization: Basic dXNlcjpwYXNz
```

**Alternative - Do client-side filtering:**

```javascript
const enabledChannels = response.entries.filter((ch) => ch.enabled);
```

### Step 3: Display in UI

**HTML Structure:**

```html
<div class="channel-list">
  <div class="channel-item" data-uuid="1a2b3c4d...">
    <img src="http://localhost:9981/imagecache/1" alt="BBC One HD" class="channel-icon" />
    <div class="channel-info">
      <span class="channel-number">101</span>
      <span class="channel-name">BBC One HD</span>
    </div>
  </div>
  <!-- More channels... -->
</div>

<div class="pagination">
  <button id="prev-page">Previous</button>
  <span>Page 1 of 3</span>
  <button id="next-page">Next</button>
</div>
```

## Complete Example Code

### JavaScript

```javascript
class ChannelList {
  constructor(apiUrl, username, password) {
    this.apiUrl = apiUrl;
    this.auth = btoa(`${username}:${password}`);
    this.currentPage = 0;
    this.pageSize = 50;
  }

  async fetchChannels(page = 0) {
    const start = page * this.pageSize;
    const url = new URL(`${this.apiUrl}/api/channel/grid`);

    url.searchParams.append('start', start);
    url.searchParams.append('limit', this.pageSize);
    url.searchParams.append('sort', 'number');
    url.searchParams.append('dir', 'ASC');

    // Filter for enabled channels only
    const filter = JSON.stringify({
      field: 'enabled',
      type: 'boolean',
      value: 1,
    });
    url.searchParams.append('filter', filter);

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${this.auth}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async render(containerId) {
    try {
      const data = await this.fetchChannels(this.currentPage);
      const container = document.getElementById(containerId);

      // Clear existing content
      container.innerHTML = '';

      // Render channels
      data.entries.forEach((channel) => {
        const channelEl = this.createChannelElement(channel);
        container.appendChild(channelEl);
      });

      // Update pagination
      this.updatePagination(data.total);
    } catch (error) {
      console.error('Failed to load channels:', error);
      this.showError('Failed to load channels. Please try again.');
    }
  }

  createChannelElement(channel) {
    const div = document.createElement('div');
    div.className = 'channel-item';
    div.dataset.uuid = channel.uuid;

    const icon = channel.iconPublicUrl
      ? `<img src="${channel.iconPublicUrl}" alt="${channel.name}" class="channel-icon">`
      : `<div class="channel-icon-placeholder">${channel.number}</div>`;

    div.innerHTML = `
      ${icon}
      <div class="channel-info">
        <span class="channel-number">${channel.number}</span>
        <span class="channel-name">${channel.name}</span>
      </div>
    `;

    // Make channel clickable
    div.addEventListener('click', () => {
      this.onChannelClick(channel);
    });

    return div;
  }

  updatePagination(total) {
    const totalPages = Math.ceil(total / this.pageSize);
    const currentPageNum = this.currentPage + 1;

    document.querySelector('.pagination span').textContent = `Page ${currentPageNum} of ${totalPages}`;

    document.getElementById('prev-page').disabled = this.currentPage === 0;
    document.getElementById('next-page').disabled = currentPageNum >= totalPages;
  }

  setupPaginationHandlers() {
    document.getElementById('prev-page').addEventListener('click', () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.render('channel-list');
      }
    });

    document.getElementById('next-page').addEventListener('click', () => {
      this.currentPage++;
      this.render('channel-list');
    });
  }

  onChannelClick(channel) {
    console.log('Selected channel:', channel);
    // Navigate to channel's EPG or start streaming
    window.location.href = `/epg?channel=${channel.uuid}`;
  }

  showError(message) {
    const container = document.getElementById('channel-list');
    container.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        <button onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

// Usage
const channelList = new ChannelList('http://localhost:9981', 'api-user', 'password');

channelList.setupPaginationHandlers();
channelList.render('channel-list');
```

### Python

```python
import requests
from typing import List, Dict

class ChannelListFetcher:
    def __init__(self, api_url: str, username: str, password: str):
        self.api_url = api_url
        self.auth = (username, password)

    def fetch_all_channels(self, enabled_only: bool = True) -> List[Dict]:
        """Fetch all channels (handles pagination automatically)"""
        channels = []
        start = 0
        page_size = 100

        while True:
            params = {
                'start': start,
                'limit': page_size,
                'sort': 'number',
                'dir': 'ASC'
            }

            if enabled_only:
                import json
                params['filter'] = json.dumps({
                    'field': 'enabled',
                    'type': 'boolean',
                    'value': 1
                })

            response = requests.get(
                f'{self.api_url}/api/channel/grid',
                auth=self.auth,
                params=params
            )

            response.raise_for_status()
            data = response.json()

            channels.extend(data['entries'])

            # Check if we've got all channels
            if len(channels) >= data['total']:
                break

            start += page_size

        return channels

    def print_channel_list(self):
        """Print formatted channel list"""
        channels = self.fetch_all_channels()

        print(f"\n{'Num':<6} {'Name':<30} {'UUID':<36}")
        print("-" * 72)

        for channel in channels:
            print(f"{channel['number']:<6} {channel['name']:<30} {channel['uuid']:<36}")

        print(f"\nTotal: {len(channels)} channels")

    def export_to_csv(self, filename: str = 'channels.csv'):
        """Export channels to CSV"""
        import csv

        channels = self.fetch_all_channels()

        with open(filename, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=['number', 'name', 'uuid', 'enabled'])
            writer.writeheader()

            for channel in channels:
                writer.writerow({
                    'number': channel['number'],
                    'name': channel['name'],
                    'uuid': channel['uuid'],
                    'enabled': channel['enabled']
                })

        print(f"Exported {len(channels)} channels to {filename}")

# Usage
fetcher = ChannelListFetcher(
    'http://localhost:9981',
    'api-user',
    'password'
)

# Print to console
fetcher.print_channel_list()

# Export to CSV
fetcher.export_to_csv()
```

## Advanced Features

### Grouping by Tags

```javascript
async function getChannelsByTag() {
  // Fetch all tags
  const tagsResponse = await fetch('http://localhost:9981/api/channeltag/list', {
    headers: { Authorization: `Basic ${auth}` },
  });
  const tags = await tagsResponse.json();

  // For each tag, fetch channels
  const channelsByTag = {};

  for (const tag of tags.entries) {
    const channelsResponse = await fetch(`http://localhost:9981/api/channel/grid?tags=${tag.key}&limit=0`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const channels = await channelsResponse.json();

    channelsByTag[tag.val] = channels.entries;
  }

  return channelsByTag;
}
```

### Search/Filter Channels

```javascript
class ChannelSearch {
  async search(query) {
    const filter = JSON.stringify({
      field: 'name',
      type: 'string',
      value: query,
      comparison: 'contains',
    });

    const url = new URL(`${this.apiUrl}/api/channel/grid`);
    url.searchParams.append('filter', filter);
    url.searchParams.append('sort', 'number');
    url.searchParams.append('limit', 50);

    const response = await fetch(url, {
      headers: { Authorization: `Basic ${this.auth}` },
    });

    return response.json();
  }
}

// Usage
const search = new ChannelSearch(apiUrl, username, password);
const results = await search.search('BBC'); // Find all BBC channels
```

### Caching

```javascript
class CachedChannelList extends ChannelList {
  constructor(apiUrl, username, password, cacheMinutes = 60) {
    super(apiUrl, username, password);
    this.cacheMinutes = cacheMinutes;
  }

  async fetchChannels(page = 0) {
    const cacheKey = `channels_page_${page}`;
    const cached = this.getFromCache(cacheKey);

    if (cached) {
      console.log('Using cached channels');
      return cached;
    }

    const data = await super.fetchChannels(page);
    this.saveToCache(cacheKey, data);
    return data;
  }

  getFromCache(key) {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const { data, timestamp } = JSON.parse(item);
    const age = (Date.now() - timestamp) / 1000 / 60; // Minutes

    if (age > this.cacheMinutes) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  }

  saveToCache(key, data) {
    const item = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  }
}
```

## Error Handling

```javascript
async function fetchChannelsWithErrorHandling() {
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (response.status === 401) {
      // Authentication failed
      showLoginPrompt();
      return null;
    }

    if (response.status === 403) {
      // Insufficient privileges
      showError('You need streaming privileges to view channels');
      return null;
    }

    if (response.status >= 500) {
      // Server error - retry after delay
      await sleep(2000);
      return fetchChannelsWithErrorHandling(); // Retry
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.text || error.error);
    }

    return response.json();
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    showError('Failed to load channels. Check your connection.');
    return null;
  }
}
```

## Related Resources

- [Pagination Guide](../../guides/pagination.md)
- [Filtering Guide](../../guides/filtering.md)
- [Channel API Reference](../../paths/channel.yaml)
- [Use Case 03: Query Program Guide](./03-query-program-guide.md)
