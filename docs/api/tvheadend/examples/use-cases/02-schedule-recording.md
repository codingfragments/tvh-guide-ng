# Use Case: Schedule Recordings

This walkthrough demonstrates how to schedule DVR recordings from EPG events.

## Scenario

A user is browsing the EPG and wants to record a specific TV program with one click.

## Requirements

- Find program in EPG
- Schedule recording with single API call
- Handle conflicts (program already scheduled)
- Support series recording
- Add recording padding (start early, end late)

## Implementation Steps

### Step 1: Find Program to Record

**Search for program:**
```http
GET /api/epg/events/grid?filter={"field":"title","type":"string","value":"Planet Earth"}
Authorization: Basic dXNlcjpwYXNz
```

**Response:**
```json
{
  "entries": [
    {
      "eventId": 123456,
      "channelUuid": "ch-uuid-bbc-one",
      "channelName": "BBC One HD",
      "start": 1704153600,
      "stop": 1704157200,
      "title": "Planet Earth II",
      "subtitle": "Islands",
      "description": "Wildlife documentary...",
      "duration": 3600
    }
  ],
  "total": 1
}
```

### Step 2: Schedule Recording

**Request:**
```http
POST /api/dvr/entry/create_by_event
Content-Type: application/json
Authorization: Basic dXNlcjpwYXNz

{
  "event_id": 123456
}
```

**Response (Success):**
```http
HTTP/1.1 200 OK

{
  "uuid": "dvr-uuid-789abc"
}
```

**Response (Conflict - Already Scheduled):**
```http
HTTP/1.1 409 Conflict

{
  "error": "Recording conflict",
  "text": "A recording already exists for this event"
}
```

### Step 3: Verify Recording Created

**Request:**
```http
GET /api/dvr/entry/grid?filter={"field":"uuid","type":"string","value":"dvr-uuid-789abc"}
Authorization: Basic dXNlcjpwYXNz
```

**Response:**
```json
{
  "entries": [{
    "uuid": "dvr-uuid-789abc",
    "channelname": "BBC One HD",
    "title": "Planet Earth II",
    "subtitle": "Islands",
    "start": 1704153600,
    "stop": 1704157200,
    "status": "scheduled",
    "sched_status": "scheduled",
    "start_extra": 0,
    "stop_extra": 0,
    "pri": 2
  }],
  "total": 1
}
```

## Complete Example Code

### JavaScript

```javascript
class RecordingManager {
  constructor(apiUrl, username, password) {
    this.apiUrl = apiUrl;
    this.auth = btoa(`${username}:${password}`);
  }

  async scheduleRecording(eventId) {
    try {
      const response = await fetch(
        `${this.apiUrl}/api/dvr/entry/create_by_event`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ event_id: eventId })
        }
      );

      if (response.status === 409) {
        return {
          success: false,
          error: 'already_scheduled',
          message: 'This program is already scheduled for recording'
        };
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.text || error.error);
      }

      const result = await response.json();

      return {
        success: true,
        dvrUuid: result.uuid,
        message: 'Recording scheduled successfully'
      };

    } catch (error) {
      console.error('Failed to schedule recording:', error);
      return {
        success: false,
        error: 'network_error',
        message: error.message
      };
    }
  }

  async cancelRecording(dvrUuid) {
    const response = await fetch(
      `${this.apiUrl}/api/dvr/entry/cancel`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uuid: dvrUuid })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to cancel recording');
    }

    return await response.json();
  }

  async isAlreadyScheduled(eventId) {
    // Check if event is already scheduled
    const response = await fetch(
      `${this.apiUrl}/api/dvr/entry/grid?status=scheduled&limit=0`,
      {
        headers: { 'Authorization': `Basic ${this.auth}` }
      }
    );

    const data = await response.json();

    return data.entries.some(entry => entry.eventId === eventId);
  }
}

// UI Integration
class RecordButton {
  constructor(eventId, recordingManager) {
    this.eventId = eventId;
    this.recordingManager = recordingManager;
    this.button = null;
  }

  render() {
    this.button = document.createElement('button');
    this.button.className = 'record-button';
    this.button.innerHTML = '⏺ Record';
    this.button.addEventListener('click', () => this.handleClick());

    // Check if already scheduled
    this.checkScheduleStatus();

    return this.button;
  }

  async checkScheduleStatus() {
    const isScheduled = await this.recordingManager.isAlreadyScheduled(this.eventId);

    if (isScheduled) {
      this.setScheduledState();
    }
  }

  async handleClick() {
    if (this.button.disabled) return;

    this.button.disabled = true;
    this.button.innerHTML = '⏳ Scheduling...';

    const result = await this.recordingManager.scheduleRecording(this.eventId);

    if (result.success) {
      this.setScheduledState(result.dvrUuid);
      this.showNotification('Recording scheduled', 'success');
    } else if (result.error === 'already_scheduled') {
      this.setScheduledState();
      this.showNotification(result.message, 'info');
    } else {
      this.button.disabled = false;
      this.button.innerHTML = '⏺ Record';
      this.showNotification(result.message, 'error');
    }
  }

  setScheduledState(dvrUuid = null) {
    this.button.className = 'record-button scheduled';
    this.button.innerHTML = '✓ Scheduled';
    this.button.disabled = false;

    if (dvrUuid) {
      this.dvrUuid = dvrUuid;
      // Add cancel option
      this.button.addEventListener('click', () => this.handleCancel());
    }
  }

  async handleCancel() {
    if (!confirm('Cancel this recording?')) return;

    this.button.disabled = true;

    try {
      await this.recordingManager.cancelRecording(this.dvrUuid);
      this.button.className = 'record-button';
      this.button.innerHTML = '⏺ Record';
      this.showNotification('Recording cancelled', 'success');
    } catch (error) {
      this.showNotification('Failed to cancel recording', 'error');
    } finally {
      this.button.disabled = false;
    }
  }

  showNotification(message, type) {
    // Implement your notification system
    console.log(`[${type}] ${message}`);
  }
}

// Usage
const recordingManager = new RecordingManager(
  'http://localhost:9981',
  'api-user',
  'password'
);

// Add record button to EPG event
const button = new RecordButton(123456, recordingManager);
document.querySelector('.epg-event').appendChild(button.render());
```

### Python

```python
import requests
from typing import Optional, Dict

class RecordingScheduler:
    def __init__(self, api_url: str, username: str, password: str):
        self.api_url = api_url
        self.auth = (username, password)

    def schedule_recording(self, event_id: int) -> Dict:
        """
        Schedule recording for an EPG event.

        Returns:
            dict with 'success', 'dvr_uuid' (if success), 'error' message
        """
        try:
            response = requests.post(
                f'{self.api_url}/api/dvr/entry/create_by_event',
                auth=self.auth,
                json={'event_id': event_id}
            )

            if response.status_code == 409:
                return {
                    'success': False,
                    'error': 'already_scheduled',
                    'message': 'Recording already exists for this event'
                }

            response.raise_for_status()
            result = response.json()

            return {
                'success': True,
                'dvr_uuid': result['uuid'],
                'message': 'Recording scheduled successfully'
            }

        except requests.RequestException as e:
            return {
                'success': False,
                'error': 'network_error',
                'message': str(e)
            }

    def cancel_recording(self, dvr_uuid: str) -> bool:
        """Cancel a scheduled recording"""
        response = requests.post(
            f'{self.api_url}/api/dvr/entry/cancel',
            auth=self.auth,
            json={'uuid': dvr_uuid}
        )

        response.raise_for_status()
        return response.json().get('success', False)

    def get_scheduled_recordings(self) -> list:
        """Get all scheduled recordings"""
        response = requests.get(
            f'{self.api_url}/api/dvr/entry/grid',
            auth=self.auth,
            params={'status': 'scheduled', 'limit': 0}
        )

        response.raise_for_status()
        return response.json()['entries']

    def is_already_scheduled(self, event_id: int) -> bool:
        """Check if event is already scheduled"""
        recordings = self.get_scheduled_recordings()
        return any(r.get('eventId') == event_id for r in recordings)

# Usage
scheduler = RecordingScheduler(
    'http://localhost:9981',
    'api-user',
    'password'
)

# Schedule recording
result = scheduler.schedule_recording(123456)

if result['success']:
    print(f"✓ Recording scheduled: {result['dvr_uuid']}")
else:
    print(f"✗ Failed: {result['message']}")
```

## Advanced Features

### Series Recording (Auto-Rec)

```javascript
async function createSeriesRecording(seriesTitle, channelUuid = null) {
  const conf = {
    name: `Record all ${seriesTitle}`,
    title: `${seriesTitle}.*`,  // Regex pattern
    fulltext: false,  // Match title field only
    start_extra: 2,  // 2 minutes before
    stop_extra: 5,   // 5 minutes after
    pri: 2
  };

  if (channelUuid) {
    conf.channel = channelUuid;
  }

  const response = await fetch(
    `${apiUrl}/api/dvr/autorec/create`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conf })
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create series recording');
  }

  return await response.json();
}

// Usage
const autorecUuid = await createSeriesRecording('Planet Earth II', 'ch-uuid-bbc');
console.log(`Series recording created: ${autorecUuid.uuid}`);
```

### Recording with Custom Padding

```javascript
async function scheduleWithPadding(eventId, prePadding = 2, postPadding = 5) {
  // Note: create_by_event uses default DVR profile padding
  // For custom padding, use manual recording:

  // First, get event details
  const eventResponse = await fetch(
    `${apiUrl}/api/epg/events/load`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ eventId })
    }
  );

  const eventData = await eventResponse.json();
  const event = eventData.entries[0];

  // Create manual recording with custom padding
  const conf = {
    channel: event.channelUuid,
    start: event.start,
    stop: event.stop,
    title: event.title,
    subtitle: event.subtitle,
    description: event.description,
    start_extra: prePadding,
    stop_extra: postPadding,
    pri: 2
  };

  const response = await fetch(
    `${apiUrl}/api/dvr/entry/create`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conf })
    }
  );

  return await response.json();
}
```

### Batch Recording

```javascript
async function scheduleBatchRecordings(eventIds) {
  const results = [];

  for (const eventId of eventIds) {
    const result = await recordingManager.scheduleRecording(eventId);
    results.push({ eventId, ...result });

    // Add delay to avoid overwhelming server
    await sleep(100);
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return {
    total: results.length,
    successful,
    failed,
    details: results
  };
}

// Usage: Record all movies tonight
const moviesFilter = JSON.stringify([
  { field: 'contentType', type: 'numeric', value: 16, comparison: 'eq' },
  { field: 'start', type: 'numeric', value: tonightStart, comparison: 'gte' },
  { field: 'stop', type: 'numeric', value: tonightEnd, comparison: 'lte' }
]);

const moviesResponse = await fetch(
  `${apiUrl}/api/epg/events/grid?filter=${encodeURIComponent(moviesFilter)}&limit=0`
);
const movies = await moviesResponse.json();

const eventIds = movies.entries.map(e => e.eventId);
const batchResult = await scheduleBatchRecordings(eventIds);

console.log(`Scheduled ${batchResult.successful}/${batchResult.total} recordings`);
```

## Error Handling

```javascript
async function scheduleRecordingSafe(eventId) {
  try {
    const result = await recordingManager.scheduleRecording(eventId);

    if (!result.success) {
      switch (result.error) {
        case 'already_scheduled':
          showNotification('Already scheduled', 'info');
          break;

        case 'insufficient_privileges':
          showNotification('You need recording privileges', 'error');
          showPermissionHelp();
          break;

        case 'event_not_found':
          showNotification('Program no longer available', 'error');
          break;

        case 'disk_full':
          showNotification('Recording storage is full', 'error');
          showDiskSpaceManager();
          break;

        default:
          showNotification(result.message, 'error');
      }

      return null;
    }

    return result.dvrUuid;

  } catch (error) {
    console.error('Recording error:', error);
    showNotification('Failed to schedule recording', 'error');
    return null;
  }
}
```

## Testing

```bash
# Find event to record
EVENT_ID=$(curl -s -u user:pass \
  'http://localhost:9981/api/epg/events/grid?limit=1' | \
  jq -r '.entries[0].eventId')

echo "Event ID: $EVENT_ID"

# Schedule recording
curl -u user:pass -X POST \
  -H "Content-Type: application/json" \
  -d "{\"event_id\":$EVENT_ID}" \
  'http://localhost:9981/api/dvr/entry/create_by_event'

# Verify scheduled
curl -s -u user:pass \
  'http://localhost:9981/api/dvr/entry/grid?status=scheduled' | \
  jq '.entries[] | "\(.title) - \(.status)"'
```

## Related Resources

- [DVR API Reference](../../paths/dvr.yaml)
- [EPG API Reference](../../paths/epg.yaml)
- [Error Handling Guide](../../guides/errors.md)
- [Use Case 03: Query Program Guide](./03-query-program-guide.md)
