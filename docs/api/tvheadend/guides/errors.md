# Error Handling Guide

This guide explains how to handle errors when working with the TVHeadend API.

## Overview

TVHeadend API returns standard HTTP status codes and JSON error responses. Understanding these error patterns helps build robust applications.

**Key principles:**
- Check HTTP status codes
- Parse JSON error responses
- Implement retry logic for transient errors
- Log errors for debugging

## HTTP Status Codes

### Success Codes

| Code | Name | Description |
|------|------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |

### Client Error Codes (4xx)

| Code | Name | Description | Typical Cause |
|------|------|-------------|---------------|
| 400 | Bad Request | Invalid parameters | Malformed filter, missing required field |
| 401 | Unauthorized | Authentication required/failed | Wrong credentials, missing auth header |
| 403 | Forbidden | Insufficient privileges | User lacks required privilege |
| 404 | Not Found | Resource doesn't exist | Invalid UUID, deleted item |
| 409 | Conflict | Request conflicts with state | Duplicate recording, constraint violation |

### Server Error Codes (5xx)

| Code | Name | Description | Typical Cause |
|------|------|-------------|---------------|
| 500 | Internal Server Error | Unexpected server error | Bug, database issue, resource exhaustion |
| 503 | Service Unavailable | Service temporarily unavailable | Server starting up, maintenance |

## Error Response Format

### Standard Error Response

```json
{
  "error": "Error message",
  "text": "Additional details (optional)"
}
```

**Fields:**
- `error` - Short error description
- `text` - Optional detailed explanation

**Example:**
```json
{
  "error": "Invalid parameters",
  "text": "The uuid parameter is required"
}
```

### Authentication Error

```json
{
  "error": "Authentication required",
  "text": "Please provide valid credentials via HTTP Basic Auth"
}
```

### Authorization Error

```json
{
  "error": "Insufficient privileges",
  "text": "Recording privilege required",
  "required_privileges": ["recording"]
}
```

**Additional field:**
- `required_privileges` - Array of privileges needed

### Validation Error

```json
{
  "error": "Validation failed",
  "fields": {
    "channel": "Channel not found",
    "start": "Start time must be in the future"
  }
}
```

**Additional field:**
- `fields` - Map of field names to error messages

## Common Errors

### 400 Bad Request

**Scenario 1: Malformed Filter**

**Request:**
```bash
curl -u user:pass \
  'http://localhost:9981/api/epg/events/grid?filter={invalid json}'
```

**Response:**
```http
HTTP/1.1 400 Bad Request

{
  "error": "Invalid parameters",
  "text": "Filter parameter must be valid JSON"
}
```

**Solution:**
- Validate JSON before sending
- Use proper URL encoding
- Check filter syntax

**Scenario 2: Missing Required Field**

**Request:**
```bash
curl -u user:pass -X POST \
  -H "Content-Type: application/json" \
  -d '{"conf":{"start":1704067200,"stop":1704070800}}' \
  'http://localhost:9981/api/dvr/entry/create'
```

**Response:**
```http
HTTP/1.1 400 Bad Request

{
  "error": "Validation failed",
  "fields": {
    "channel": "Channel UUID is required",
    "title": "Title is required"
  }
}
```

**Solution:**
- Check required fields in OpenAPI spec
- Validate input before sending

**Scenario 3: Invalid UUID Format**

**Request:**
```bash
curl -u user:pass \
  'http://localhost:9981/api/epg/events/load' \
  -X POST -d '{"eventId":"not-a-number"}'
```

**Response:**
```http
HTTP/1.1 400 Bad Request

{
  "error": "Invalid parameters",
  "text": "eventId must be a number"
}
```

### 401 Unauthorized

**Scenario 1: Missing Credentials**

**Request:**
```bash
curl 'http://localhost:9981/api/channel/grid'
```

**Response:**
```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Basic realm="TVHeadend"

{
  "error": "Authentication required",
  "text": "Please provide valid credentials via HTTP Basic Auth"
}
```

**Solution:**
```bash
curl -u username:password 'http://localhost:9981/api/channel/grid'
```

**Scenario 2: Wrong Credentials**

**Request:**
```bash
curl -u wrong:credentials 'http://localhost:9981/api/channel/grid'
```

**Response:**
```http
HTTP/1.1 401 Unauthorized

{
  "error": "Authentication failed",
  "text": "Invalid username or password"
}
```

**Solution:**
- Verify credentials in TVHeadend UI
- Check for typos
- Ensure user is enabled

### 403 Forbidden

**Scenario: Insufficient Privileges**

**Request:**
```bash
# User only has 'streaming' privilege
curl -u viewer:pass -X POST \
  -d '{"event_id":123456}' \
  'http://localhost:9981/api/dvr/entry/create_by_event'
```

**Response:**
```http
HTTP/1.1 403 Forbidden

{
  "error": "Insufficient privileges",
  "text": "Recording privilege required",
  "required_privileges": ["recording"]
}
```

**Solution:**
- Add required privilege to user in TVHeadend UI
- Use different user with appropriate privileges
- Request admin to grant privileges

### 404 Not Found

**Scenario 1: Invalid Channel UUID**

**Request:**
```bash
curl -u user:pass \
  'http://localhost:9981/api/epg/events/grid?channel=invalid-uuid-123'
```

**Response:**
```http
HTTP/1.1 404 Not Found

{
  "error": "Channel not found",
  "text": "No channel exists with the provided UUID"
}
```

**Solution:**
- Verify UUID by listing channels first
- Check if channel was deleted
- Update cached UUIDs

**Scenario 2: EPG Event Not Found**

**Request:**
```bash
curl -u user:pass -X POST \
  -d '{"event_id":999999}' \
  'http://localhost:9981/api/dvr/entry/create_by_event'
```

**Response:**
```http
HTTP/1.1 404 Not Found

{
  "error": "EPG event not found",
  "text": "The requested event is not in the program guide"
}
```

**Possible causes:**
- Event is in the past and has expired
- EPG data not yet loaded
- Wrong event ID

### 409 Conflict

**Scenario: Duplicate Recording**

**Request:**
```bash
# Try to record same event twice
curl -u user:pass -X POST \
  -d '{"event_id":123456}' \
  'http://localhost:9981/api/dvr/entry/create_by_event'
```

**Response:**
```http
HTTP/1.1 409 Conflict

{
  "error": "Recording conflict",
  "text": "A recording already exists for this event"
}
```

**Solution:**
- Check existing recordings first
- Handle duplicate gracefully
- Update existing recording instead

### 500 Internal Server Error

**Response:**
```http
HTTP/1.1 500 Internal Server Error

{
  "error": "Internal server error",
  "text": "An unexpected error occurred. Please check TVHeadend logs."
}
```

**Possible causes:**
- TVHeadend bug
- Database corruption
- Disk full
- Out of memory

**Solutions:**
1. Check TVHeadend logs: `/var/log/tvheadend.log`
2. Restart TVHeadend: `systemctl restart tvheadend`
3. Check disk space: `df -h`
4. Check memory: `free -h`
5. Report bug to TVHeadend project

## Error Handling Patterns

### Pattern 1: Basic Error Handling

```javascript
async function fetchChannels() {
  try {
    const response = await fetch('http://localhost:9981/api/channel/grid', {
      headers: {
        'Authorization': 'Basic ' + btoa('user:pass')
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.error} - ${error.text}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    throw error;
  }
}
```

### Pattern 2: Specific Error Handling

```python
import requests
from requests.exceptions import RequestException

def fetch_epg_events():
    try:
        response = requests.get(
            'http://localhost:9981/api/epg/events/grid',
            auth=('user', 'pass'),
            params={'mode': 'now', 'limit': 50}
        )

        if response.status_code == 401:
            raise AuthenticationError("Invalid credentials")
        elif response.status_code == 403:
            error_data = response.json()
            required = error_data.get('required_privileges', [])
            raise PermissionError(f"Missing privileges: {', '.join(required)}")
        elif response.status_code == 404:
            return {'entries': [], 'total': 0}  # No data found
        elif response.status_code >= 500:
            raise ServerError("TVHeadend server error")

        response.raise_for_status()
        return response.json()

    except RequestException as e:
        print(f"Network error: {e}")
        raise

class AuthenticationError(Exception):
    pass

class PermissionError(Exception):
    pass

class ServerError(Exception):
    pass
```

### Pattern 3: Retry with Exponential Backoff

```python
import time
import requests

def fetch_with_retry(url, max_retries=3):
    """
    Retry failed requests with exponential backoff.
    Only retries on transient errors (5xx, timeouts).
    """
    for attempt in range(max_retries):
        try:
            response = requests.get(url, auth=('user', 'pass'), timeout=10)

            # Don't retry client errors (4xx)
            if 400 <= response.status_code < 500:
                response.raise_for_status()

            # Retry server errors (5xx)
            if response.status_code >= 500:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # 1s, 2s, 4s
                    print(f"Server error, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                else:
                    response.raise_for_status()

            return response.json()

        except requests.Timeout:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                print(f"Timeout, retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                raise

        except requests.RequestException as e:
            if attempt < max_retries - 1:
                print(f"Request failed: {e}, retrying...")
                time.sleep(2 ** attempt)
            else:
                raise

    raise Exception("Max retries exceeded")
```

### Pattern 4: Graceful Degradation

```javascript
class TVHeadendClient {
  async getChannels() {
    try {
      const data = await this.fetch('/api/channel/grid');
      return data.entries;
    } catch (error) {
      if (error.status === 401) {
        // Authentication failed - redirect to login
        window.location.href = '/login';
        return [];
      } else if (error.status === 404) {
        // No channels found - return empty array
        console.warn('No channels available');
        return [];
      } else if (error.status >= 500) {
        // Server error - show error message, return cached data
        this.showError('Server temporarily unavailable');
        return this.getCachedChannels() || [];
      } else {
        // Unknown error - log and return empty
        console.error('Unexpected error:', error);
        return [];
      }
    }
  }

  getCachedChannels() {
    const cached = localStorage.getItem('channels');
    if (cached) {
      const data = JSON.parse(cached);
      // Check if cache is fresh (< 1 hour old)
      if (Date.now() - data.timestamp < 3600000) {
        return data.channels;
      }
    }
    return null;
  }

  async fetch(endpoint) {
    const response = await fetch(`http://localhost:9981${endpoint}`, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`)
      }
    });

    if (!response.ok) {
      const error = new Error('API request failed');
      error.status = response.status;
      error.data = await response.json().catch(() => ({}));
      throw error;
    }

    return response.json();
  }
}
```

### Pattern 5: User-Friendly Error Messages

```javascript
function getErrorMessage(error) {
  const messages = {
    401: 'Please log in to continue',
    403: 'You don\'t have permission for this action',
    404: 'The requested item could not be found',
    409: 'This action conflicts with an existing item',
    500: 'Server error - please try again later',
    503: 'Service temporarily unavailable'
  };

  if (error.status in messages) {
    return messages[error.status];
  }

  if (error.data && error.data.text) {
    return error.data.text;
  }

  return 'An unexpected error occurred';
}

// Usage in UI
try {
  await scheduleRecording(eventId);
  showSuccess('Recording scheduled successfully');
} catch (error) {
  const message = getErrorMessage(error);
  showError(message);
}
```

## Best Practices

### 1. Always Check HTTP Status

```javascript
// ✅ GOOD: Check status before parsing
const response = await fetch(url);
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.text);
}
const data = await response.json();
```

```javascript
// ❌ BAD: Assume success
const response = await fetch(url);
const data = await response.json();  // May throw if error response
```

### 2. Parse Error Responses

```javascript
// ✅ GOOD: Parse error details
if (!response.ok) {
  try {
    const error = await response.json();
    console.error(`Error: ${error.error}`, error);
  } catch {
    console.error(`HTTP ${response.status}: ${response.statusText}`);
  }
}
```

### 3. Don't Retry Client Errors

```python
# ✅ GOOD: Only retry transient errors
if response.status_code >= 500:
    # Retry server errors
    retry()
elif response.status_code == 429:
    # Retry rate limits after delay
    time.sleep(60)
    retry()
else:
    # Don't retry 4xx errors
    response.raise_for_status()
```

```python
# ❌ BAD: Retrying auth errors wastes time
for i in range(10):
    response = requests.get(url, auth=('wrong', 'password'))
    # Will fail 10 times!
```

### 4. Log Errors for Debugging

```javascript
function logError(error, context) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    status: error.status,
    message: error.message,
    context: context,
    response: error.data
  };

  console.error('API Error:', logEntry);

  // Send to logging service
  if (window.errorLogger) {
    window.errorLogger.send(logEntry);
  }
}

// Usage
try {
  await client.createRecording(eventId);
} catch (error) {
  logError(error, {
    action: 'create_recording',
    eventId: eventId,
    user: currentUser
  });
  throw error;
}
```

### 5. Provide Actionable Feedback

```javascript
function handleRecordingError(error) {
  if (error.status === 409) {
    return {
      message: 'This program is already scheduled for recording',
      action: 'View scheduled recordings',
      link: '/recordings?status=scheduled'
    };
  } else if (error.status === 403) {
    return {
      message: 'You need recording permission to schedule recordings',
      action: 'Contact administrator',
      link: '/help/permissions'
    };
  } else if (error.status === 404) {
    return {
      message: 'This program is no longer available in the guide',
      action: 'Browse current programs',
      link: '/epg'
    };
  } else {
    return {
      message: 'Failed to schedule recording',
      action: 'Try again',
      link: null
    };
  }
}
```

## Testing Error Handling

### Test Invalid Credentials

```bash
# Should return 401
curl -v -u wrong:credentials \
  'http://localhost:9981/api/channel/grid'
```

### Test Missing Privileges

```bash
# Create user with only 'streaming' privilege, test recording
curl -v -u viewer:pass -X POST \
  -d '{"event_id":123456}' \
  'http://localhost:9981/api/dvr/entry/create_by_event'

# Should return 403
```

### Test Invalid UUID

```bash
# Should return 404
curl -v -u user:pass \
  'http://localhost:9981/api/epg/events/grid?channel=invalid-uuid'
```

### Test Malformed Request

```bash
# Should return 400
curl -v -u user:pass -X POST \
  -H "Content-Type: application/json" \
  -d '{"invalid":"json"' \
  'http://localhost:9981/api/dvr/entry/create'
```

## Debugging Tips

### 1. Use Verbose Mode

```bash
curl -v -u user:pass 'http://localhost:9981/api/channel/grid'
```

Shows full HTTP request/response headers.

### 2. Check TVHeadend Logs

```bash
# View real-time logs
tail -f /var/log/tvheadend.log

# Search for errors
grep ERROR /var/log/tvheadend.log

# Check recent API requests
grep "HTTP" /var/log/tvheadend.log | tail -20
```

### 3. Test with Browser DevTools

1. Open TVHeadend web UI
2. Open Browser DevTools (F12)
3. Go to Network tab
4. Perform action that fails
5. Inspect API request/response

### 4. Isolate the Problem

```bash
# Test authentication
curl -u user:pass 'http://localhost:9981/api/serverinfo'

# Test without parameters
curl -u user:pass 'http://localhost:9981/api/channel/grid?limit=1'

# Add parameters incrementally
curl -u user:pass 'http://localhost:9981/api/channel/grid?limit=1&sort=number'
```

## Additional Resources

- [Authentication Guide](./authentication.md) - Fix 401/403 errors
- [Filtering Guide](./filtering.md) - Avoid 400 errors from filters
- [OpenAPI Specification](../openapi.yaml) - Error response schemas
- [TVHeadend Documentation](https://docs.tvheadend.org/) - Server configuration
