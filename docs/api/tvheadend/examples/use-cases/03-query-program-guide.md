# Use Case: Query Electronic Program Guide (EPG)

This walkthrough demonstrates how to query and display the EPG for a multi-channel TV guide.

## Scenario

Build a web-based EPG grid showing what's currently airing and upcoming programs across multiple channels.

## Requirements

- Display current programs for all channels
- Show upcoming programs (next 4-6 hours)
- Support time-based navigation (scroll forward/backward)
- Filter by genre/content type
- Search programs by title
- Handle missing EPG data gracefully

## Implementation Steps

### Step 1: Get Current Programs

**Request - All channels, currently airing:**
```http
GET /api/epg/events/grid?mode=now&limit=100
Authorization: Basic dXNlcjpwYXNz
```

**Response:**
```json
{
  "entries": [
    {
      "eventId": 123456,
      "channelUuid": "ch-bbc-one",
      "channelName": "BBC One HD",
      "channelNumber": 101,
      "start": 1704067200,
      "stop": 1704070800,
      "title": "News at Six",
      "subtitle": "",
      "description": "Latest news and weather",
      "duration": 3600,
      "hd": true
    },
    {
      "eventId": 123457,
      "channelUuid": "ch-bbc-two",
      "channelName": "BBC Two HD",
      "channelNumber": 102,
      "start": 1704067200,
      "stop": 1704069000,
      "title": "University Challenge",
      "subtitle": "Episode 12",
      "description": "Quiz show",
      "duration": 1800
    }
  ],
  "total": 85
}
```

### Step 2: Get Programs for Time Window

**Request - 6-hour window:**
```http
GET /api/epg/events/grid?channel=ch-bbc-one&sort=start&dir=ASC&limit=20
Authorization: Basic dXNlcjpwYXNz
```

With filter for time range:
```json
{
  "filter": [
    {"field": "start", "type": "numeric", "value": 1704067200, "comparison": "gte"},
    {"field": "stop", "type": "numeric", "value": 1704088800, "comparison": "lte"}
  ]
}
```

### Step 3: Search Programs

**Search by title:**
```http
GET /api/epg/events/grid?filter=documentary&fulltext=1&limit=50
Authorization: Basic dXNlcjpwYXNz
```

**Filter by genre/content type:**
```http
GET /api/epg/events/grid?contentType=16&limit=50
Authorization: Basic dXNlcjpwYXNz
```

## Complete Example Code

### JavaScript - EPG Grid Component

```javascript
class EPGGrid {
  constructor(apiUrl, username, password) {
    this.apiUrl = apiUrl;
    this.auth = btoa(`${username}:${password}`);
    this.channels = [];
    this.currentTime = Math.floor(Date.now() / 1000);
    this.timeWindow = 6 * 3600;  // 6 hours
  }

  async initialize() {
    // Load channels first
    this.channels = await this.fetchChannels();

    // Load EPG for each channel
    await this.loadEPG();
  }

  async fetchChannels() {
    const response = await fetch(
      `${this.apiUrl}/api/channel/grid?sort=number&dir=ASC&limit=0`,
      {
        headers: { 'Authorization': `Basic ${this.auth}` }
      }
    );

    const data = await response.json();
    return data.entries.filter(ch => ch.enabled);
  }

  async loadEPG() {
    const startTime = this.currentTime;
    const endTime = this.currentTime + this.timeWindow;

    const filter = JSON.stringify([
      { field: 'start', type: 'numeric', value: startTime, comparison: 'gte' },
      { field: 'stop', type: 'numeric', value: endTime, comparison: 'lte' }
    ]);

    const response = await fetch(
      `${this.apiUrl}/api/epg/events/grid?filter=${encodeURIComponent(filter)}&limit=0`,
      {
        headers: { 'Authorization': `Basic ${this.auth}` }
      }
    );

    const data = await response.json();

    // Group events by channel
    this.epgData = this.groupByChannel(data.entries);
  }

  groupByChannel(events) {
    const grouped = {};

    for (const event of events) {
      if (!grouped[event.channelUuid]) {
        grouped[event.channelUuid] = [];
      }
      grouped[event.channelUuid].push(event);
    }

    // Sort events by start time within each channel
    for (const channelUuid in grouped) {
      grouped[channelUuid].sort((a, b) => a.start - b.start);
    }

    return grouped;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Create time header
    const timeHeader = this.createTimeHeader();
    container.appendChild(timeHeader);

    // Create channel rows
    for (const channel of this.channels) {
      const row = this.createChannelRow(channel);
      container.appendChild(row);
    }

    // Add scrolling and interaction handlers
    this.setupInteraction(container);
  }

  createTimeHeader() {
    const header = document.createElement('div');
    header.className = 'epg-time-header';

    const startTime = this.currentTime;
    const hours = 6;

    for (let i = 0; i < hours; i++) {
      const hourTime = startTime + (i * 3600);
      const hourEl = document.createElement('div');
      hourEl.className = 'time-marker';
      hourEl.textContent = new Date(hourTime * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
      header.appendChild(hourEl);
    }

    return header;
  }

  createChannelRow(channel) {
    const row = document.createElement('div');
    row.className = 'epg-channel-row';

    // Channel info
    const channelInfo = document.createElement('div');
    channelInfo.className = 'channel-info';
    channelInfo.innerHTML = `
      <span class="channel-number">${channel.number}</span>
      <span class="channel-name">${channel.name}</span>
    `;
    row.appendChild(channelInfo);

    // Program blocks
    const programsContainer = document.createElement('div');
    programsContainer.className = 'programs-container';

    const events = this.epgData[channel.uuid] || [];

    for (const event of events) {
      const programBlock = this.createProgramBlock(event);
      programsContainer.appendChild(programBlock);
    }

    // Handle empty EPG
    if (events.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'no-epg-data';
      placeholder.textContent = 'No program information';
      programsContainer.appendChild(placeholder);
    }

    row.appendChild(programsContainer);

    return row;
  }

  createProgramBlock(event) {
    const block = document.createElement('div');
    block.className = 'program-block';
    block.dataset.eventId = event.eventId;

    // Calculate width based on duration
    const duration = event.stop - event.start;
    const width = (duration / 3600) * 100;  // 100px per hour
    block.style.width = `${width}px`;

    // Calculate position based on start time
    const offset = event.start - this.currentTime;
    const left = (offset / 3600) * 100;
    block.style.left = `${left}px`;

    // Content
    const now = Math.floor(Date.now() / 1000);
    const isLive = event.start <= now && event.stop > now;

    block.innerHTML = `
      ${isLive ? '<span class="live-indicator">LIVE</span>' : ''}
      <div class="program-time">
        ${this.formatTime(event.start)} - ${this.formatTime(event.stop)}
      </div>
      <div class="program-title">${event.title}</div>
      ${event.subtitle ? `<div class="program-subtitle">${event.subtitle}</div>` : ''}
    `;

    if (isLive) {
      block.classList.add('live');
    }

    // Add click handler
    block.addEventListener('click', () => this.onProgramClick(event));

    return block;
  }

  formatTime(timestamp) {
    return new Date(timestamp * 1000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  setupInteraction(container) {
    // Current time indicator
    this.updateCurrentTimeIndicator(container);
    setInterval(() => this.updateCurrentTimeIndicator(container), 60000);

    // Scroll to current time
    this.scrollToNow(container);
  }

  updateCurrentTimeIndicator(container) {
    let indicator = container.querySelector('.current-time-indicator');

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'current-time-indicator';
      container.appendChild(indicator);
    }

    const now = Math.floor(Date.now() / 1000);
    const offset = (now - this.currentTime) / 3600 * 100;
    indicator.style.left = `${offset}px`;
  }

  scrollToNow(container) {
    const now = Math.floor(Date.now() / 1000);
    const offset = (now - this.currentTime) / 3600 * 100;
    container.scrollLeft = Math.max(0, offset - 200);  // Center-ish
  }

  onProgramClick(event) {
    console.log('Clicked program:', event);

    // Show program details modal
    this.showProgramDetails(event.eventId);
  }

  async showProgramDetails(eventId) {
    // Load full event details
    const response = await fetch(
      `${this.apiUrl}/api/epg/events/load`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId })
      }
    );

    const data = await response.json();
    const event = data.entries[0];

    // Display in modal (implement your modal UI)
    this.displayModal(event);
  }

  displayModal(event) {
    const modal = document.createElement('div');
    modal.className = 'epg-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h2>${event.title}</h2>
        ${event.subtitle ? `<h3>${event.subtitle}</h3>` : ''}
        <p class="program-time">
          ${this.formatTime(event.start)} - ${this.formatTime(event.stop)}
          on ${event.channelName}
        </p>
        <p class="program-description">${event.description || 'No description available'}</p>
        <div class="modal-actions">
          <button onclick="recordingManager.scheduleRecording(${event.eventId})">
            ⏺ Record
          </button>
          <button onclick="this.closest('.epg-modal').remove()">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Navigation methods
  async navigateForward() {
    this.currentTime += this.timeWindow;
    await this.loadEPG();
    this.render('epg-grid');
  }

  async navigateBackward() {
    this.currentTime -= this.timeWindow;
    await this.loadEPG();
    this.render('epg-grid');
  }

  async jumpToNow() {
    this.currentTime = Math.floor(Date.now() / 1000);
    await this.loadEPG();
    this.render('epg-grid');
  }
}

// Usage
const epg = new EPGGrid(
  'http://localhost:9981',
  'api-user',
  'password'
);

await epg.initialize();
epg.render('epg-grid');

// Navigation buttons
document.getElementById('btn-backward').addEventListener('click', () => epg.navigateBackward());
document.getElementById('btn-forward').addEventListener('click', () => epg.navigateForward());
document.getElementById('btn-now').addEventListener('click', () => epg.jumpToNow());
```

### Python - EPG Data Export

```python
import requests
import json
from datetime import datetime, timedelta

class EPGExporter:
    def __init__(self, api_url: str, username: str, password: str):
        self.api_url = api_url
        self.auth = (username, password)

    def get_daily_schedule(self, channel_uuid: str, date: datetime):
        """Get full day schedule for a channel"""
        start_time = int(date.replace(hour=0, minute=0, second=0).timestamp())
        end_time = int(date.replace(hour=23, minute=59, second=59).timestamp())

        filter_obj = [
            {"field": "start", "type": "numeric", "value": start_time, "comparison": "gte"},
            {"field": "stop", "type": "numeric", "value": end_time, "comparison": "lte"}
        ]

        response = requests.get(
            f'{self.api_url}/api/epg/events/grid',
            auth=self.auth,
            params={
                'channel': channel_uuid,
                'filter': json.dumps(filter_obj),
                'sort': 'start',
                'dir': 'ASC',
                'limit': 0
            }
        )

        response.raise_for_status()
        return response.json()['entries']

    def export_week_schedule(self, channel_uuid: str, output_file: str):
        """Export week schedule to JSON"""
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)

        week_schedule = {}

        for day_offset in range(7):
            date = today + timedelta(days=day_offset)
            day_key = date.strftime('%Y-%m-%d')

            print(f"Fetching schedule for {day_key}...")
            events = self.get_daily_schedule(channel_uuid, date)

            week_schedule[day_key] = [
                {
                    'start': datetime.fromtimestamp(e['start']).isoformat(),
                    'stop': datetime.fromtimestamp(e['stop']).isoformat(),
                    'title': e['title'],
                    'subtitle': e.get('subtitle'),
                    'description': e.get('description')
                }
                for e in events
            ]

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(week_schedule, f, indent=2, ensure_ascii=False)

        print(f"Exported to {output_file}")

    def find_prime_time_movies(self):
        """Find movies airing in prime time (20:00-23:00) this week"""
        movies = []

        for day_offset in range(7):
            date = datetime.now() + timedelta(days=day_offset)
            start_time = int(date.replace(hour=20, minute=0, second=0).timestamp())
            end_time = int(date.replace(hour=23, minute=0, second=0).timestamp())

            filter_obj = [
                {"field": "contentType", "type": "numeric", "value": 16, "comparison": "eq"},
                {"field": "start", "type": "numeric", "value": start_time, "comparison": "gte"},
                {"field": "start", "type": "numeric", "value": end_time, "comparison": "lt"}
            ]

            response = requests.get(
                f'{self.api_url}/api/epg/events/grid',
                auth=self.auth,
                params={
                    'filter': json.dumps(filter_obj),
                    'limit': 0
                }
            )

            response.raise_for_status()
            movies.extend(response.json()['entries'])

        return movies

# Usage
exporter = EPGExporter(
    'http://localhost:9981',
    'api-user',
    'password'
)

# Export week schedule
exporter.export_week_schedule('channel-uuid-bbc-one', 'bbc_one_week.json')

# Find prime time movies
movies = exporter.find_prime_time_movies()
print(f"Found {len(movies)} movies in prime time this week")
```

## Advanced Features

### Genre Filter

```javascript
async function filterByGenre(genreCode) {
  const response = await fetch(
    `${apiUrl}/api/epg/events/grid?contentType=${genreCode}&limit=100`,
    {
      headers: { 'Authorization': `Basic ${auth}` }
    }
  );

  return await response.json();
}

// Common genres
const GENRES = {
  MOVIE: 16,
  NEWS: 32,
  SHOW: 48,
  SPORTS: 64,
  CHILDREN: 80,
  MUSIC: 96
};

// Get all sports programs
const sports = await filterByGenre(GENRES.SPORTS);
```

### Search with Highlighting

```javascript
async function searchPrograms(query) {
  const response = await fetch(
    `${apiUrl}/api/epg/events/grid?filter=${encodeURIComponent(query)}&fulltext=1&limit=50`,
    {
      headers: { 'Authorization': `Basic ${auth}` }
    }
  );

  const data = await response.json();

  // Add highlights
  return data.entries.map(event => ({
    ...event,
    titleHighlighted: highlightText(event.title, query),
    descriptionHighlighted: highlightText(event.description, query)
  }));
}

function highlightText(text, query) {
  if (!text) return '';

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}
```

## CSS Styling

```css
.epg-grid {
  display: flex;
  flex-direction: column;
  overflow-x: auto;
  overflow-y: auto;
  height: 600px;
  position: relative;
}

.epg-channel-row {
  display: flex;
  border-bottom: 1px solid #ddd;
  min-height: 60px;
}

.channel-info {
  width: 150px;
  padding: 10px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  position: sticky;
  left: 0;
  z-index: 2;
}

.programs-container {
  position: relative;
  flex: 1;
  min-width: 600px;
}

.program-block {
  position: absolute;
  height: 50px;
  background: #e0e0e0;
  border: 1px solid #ccc;
  padding: 5px;
  cursor: pointer;
  overflow: hidden;
  transition: background 0.2s;
}

.program-block:hover {
  background: #d0d0d0;
  z-index: 10;
}

.program-block.live {
  background: #4CAF50;
  color: white;
}

.current-time-indicator {
  position: absolute;
  width: 2px;
  height: 100%;
  background: red;
  z-index: 100;
  pointer-events: none;
}
```

## Related Resources

- [EPG API Reference](../../paths/epg.yaml)
- [Filtering Guide](../../guides/filtering.md)
- [Pagination Guide](../../guides/pagination.md)
- [Use Case 01: List Channels](./01-list-channels.md)
- [Use Case 02: Schedule Recording](./02-schedule-recording.md)
