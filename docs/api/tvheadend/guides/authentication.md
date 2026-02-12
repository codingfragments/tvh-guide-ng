# Authentication Guide

This guide explains how to authenticate with the TVHeadend API and understand the privilege system.

## Overview

TVHeadend uses **HTTP Basic Authentication** for all API requests. You must create a user account in TVHeadend and assign appropriate privileges before making API calls.

## Quick Start

**Example authenticated request:**

```bash
curl -u username:password \
  http://localhost:9981/api/channel/grid
```

**With explicit headers:**

```bash
curl -H "Authorization: Basic $(echo -n 'username:password' | base64)" \
  http://localhost:9981/api/channel/grid
```

## Creating API Users

### Via TVHeadend Web UI

1. Open TVHeadend web interface: `http://localhost:9981`
2. Navigate to **Configuration** → **Users** → **Access Entries**
3. Click **Add** button
4. Configure user:
   - **Enabled:** Yes
   - **Username:** Enter username (e.g., `api-client`)
   - **Password:** Enter secure password
   - **Network Prefix:** Leave empty for any IP, or restrict (e.g., `192.168.1.0/24`)
   - **Privileges:** Select required privileges (see below)
5. Click **Save**

### Via Command Line (Advanced)

TVHeadend stores user configuration in `/home/hts/.hts/tvheadend/accesscontrol/`.
However, using the Web UI is strongly recommended for proper privilege setup.

## Privilege System

TVHeadend uses a fine-grained privilege system. Each user can be assigned one or more of these privileges:

### Privilege Types

| Privilege | Description | Required For |
|-----------|-------------|--------------|
| **admin** | Full administrative access | Config changes, user management, all operations |
| **streaming** | Stream live TV and recordings | Watching live TV, playing recordings |
| **recording** | Create and manage DVR recordings | Scheduling recordings, managing DVR |
| **failed_recorder** | View failed recordings | Accessing error logs for failed recordings |
| **htsp_streaming** | HTSP protocol streaming access | Using Kodi, other HTSP clients |
| **htsp_recorder** | HTSP recording access | Recording via HTSP clients |
| **htsp_anonymize** | Anonymize HTSP connections | Privacy features for HTSP |
| **web_only** | Web interface only | Web UI access without streaming |

### Privilege Requirements by API Endpoint

**EPG Endpoints** (Read-only):
- **streaming** privilege recommended
- Can work without explicit privileges for basic EPG queries
- Example: `/api/epg/events/grid`

**Channel Endpoints:**
- **streaming** - Read channel list
- **admin** - Create/modify channels
- Example: `/api/channel/grid` (streaming), `/api/channel/create` (admin)

**DVR Endpoints:**
- **recording** - Schedule recordings, create auto-rec rules
- **streaming** - View recording list
- **admin** - Advanced DVR configuration
- Example: `/api/dvr/entry/create` (recording required)

**Config Endpoints:**
- **admin** - All configuration operations
- Example: `/api/config/save` (admin required)

**Status Endpoints:**
- **admin** - Full status access
- **streaming** - Limited status info
- Example: `/api/status` (streaming), `/api/status/connections` (admin)

### Typical User Profiles

**Read-Only EPG Client:**
```yaml
Privileges: streaming
Use Case: Display program guide, browse channels
```

**Recording Client:**
```yaml
Privileges: streaming, recording
Use Case: Full DVR functionality, watch live TV
```

**Admin Client:**
```yaml
Privileges: admin, streaming, recording
Use Case: Full system management, monitoring
```

## Security Best Practices

### 1. Use Dedicated API Users

Create separate users for different applications/clients:

```bash
# EPG display application
Username: epg-app
Privileges: streaming

# Recording automation
Username: dvr-bot
Privileges: streaming, recording

# Monitoring dashboard
Username: monitor
Privileges: admin
```

**Benefits:**
- Easy to revoke access for specific client
- Audit trail in logs
- Principle of least privilege

### 2. Enable HTTPS

TVHeadend sends credentials in Base64 encoding (not encrypted). Always use HTTPS in production:

**Configure HTTPS in TVHeadend:**
1. Configuration → General → Base
2. Enable **Use SSL/TLS**
3. Provide certificate and key paths
4. Restart TVHeadend

**Update API URL:**
```bash
curl -u username:password \
  https://tvheadend.example.com:9981/api/channel/grid
```

### 3. Restrict by IP Address

Limit user access to specific networks:

```
Network Prefix Examples:
- 192.168.1.0/24 - Entire local subnet
- 192.168.1.100/32 - Single IP address
- 10.0.0.0/8 - Large private network
- Empty - Allow from anywhere (not recommended)
```

### 4. Use Strong Passwords

For API users:
- Minimum 16 characters
- Mix of letters, numbers, symbols
- Unique per user
- Rotate regularly (every 90 days)

**Generate secure password:**
```bash
openssl rand -base64 24
```

### 5. Implement Rate Limiting

Protect against brute force attacks:
- Use reverse proxy (nginx, Caddy) with rate limiting
- Monitor failed authentication attempts
- Implement IP blocking after repeated failures

**Example nginx rate limiting:**
```nginx
limit_req_zone $binary_remote_addr zone=tvh_api:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=tvh_api burst=20 nodelay;
        proxy_pass http://localhost:9981;
    }
}
```

### 6. Rotate Credentials

Establish a credential rotation policy:
- Change passwords every 90 days
- Update client configurations
- Log rotation events

## Handling Authentication Errors

### 401 Unauthorized

**Cause:** Invalid credentials or missing authentication header

**Response:**
```json
{
  "error": "Authentication required",
  "text": "Please provide valid credentials via HTTP Basic Auth"
}
```

**Solutions:**
1. Verify username and password are correct
2. Check user is enabled in TVHeadend
3. Ensure credentials are properly encoded
4. Test with web UI login first

**Debug:**
```bash
# Test credentials with basic auth
curl -v -u username:password \
  http://localhost:9981/api/serverinfo

# Check base64 encoding
echo -n 'username:password' | base64
```

### 403 Forbidden

**Cause:** Authenticated but insufficient privileges

**Response:**
```json
{
  "error": "Insufficient privileges",
  "text": "Recording privilege required",
  "required_privileges": ["recording"]
}
```

**Solutions:**
1. Add required privilege to user account
2. Use different user with appropriate privileges
3. Contact admin for privilege upgrade

**Check user privileges:**
- Log into TVHeadend web UI as admin
- Configuration → Users → Access Entries
- Find user and verify privilege checkboxes

## Code Examples

### JavaScript/Node.js

```javascript
const axios = require('axios');

const tvhClient = axios.create({
  baseURL: 'http://localhost:9981',
  auth: {
    username: 'api-user',
    password: 'secure-password'
  }
});

// Query EPG
const epg = await tvhClient.get('/api/epg/events/grid', {
  params: {
    mode: 'now',
    limit: 50
  }
});

console.log(epg.data);
```

### Python

```python
import requests
from requests.auth import HTTPBasicAuth

# Setup authentication
auth = HTTPBasicAuth('api-user', 'secure-password')
base_url = 'http://localhost:9981'

# Query channels
response = requests.get(
    f'{base_url}/api/channel/grid',
    auth=auth,
    params={'limit': 50}
)

if response.status_code == 200:
    channels = response.json()
    print(f"Found {channels['total']} channels")
elif response.status_code == 401:
    print("Authentication failed - check credentials")
elif response.status_code == 403:
    print("Insufficient privileges")
```

### Go

```go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type GridResponse struct {
    Entries []map[string]interface{} `json:"entries"`
    Total   int                      `json:"total"`
}

func main() {
    client := &http.Client{}

    req, _ := http.NewRequest("GET",
        "http://localhost:9981/api/channel/grid?limit=50", nil)

    req.SetBasicAuth("api-user", "secure-password")

    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    var result GridResponse
    json.NewDecoder(resp.Body).Decode(&result)

    fmt.Printf("Found %d channels\n", result.Total)
}
```

### cURL Advanced Examples

**Store credentials in file:**
```bash
# Create .netrc file (chmod 600)
cat > ~/.netrc << EOF
machine localhost
    login api-user
    password secure-password
EOF

chmod 600 ~/.netrc

# Use with curl
curl -n http://localhost:9981/api/channel/grid
```

**Use environment variables:**
```bash
export TVH_USER="api-user"
export TVH_PASS="secure-password"
export TVH_URL="http://localhost:9981"

curl -u "$TVH_USER:$TVH_PASS" \
  "$TVH_URL/api/epg/events/grid?mode=now"
```

## Troubleshooting

### Problem: Authentication works in browser but fails in API client

**Cause:** Browser may have saved session/cookies

**Solution:** Test with fresh incognito window or use curl:
```bash
curl -v -u username:password http://localhost:9981/api/serverinfo
```

### Problem: Intermittent 401 errors

**Possible causes:**
1. Password contains special characters causing encoding issues
2. Credential rotation in progress
3. Network proxy interfering

**Debug:**
```bash
# Check if special chars are causing issues
curl -v -u 'username':'password' http://localhost:9981/api/serverinfo

# Test with URL-encoded password
PASS_ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$PASS'))")
curl -u "username:$PASS_ENCODED" http://localhost:9981/api/serverinfo
```

### Problem: 403 Forbidden despite having privileges

**Possible causes:**
1. User privileges not saved properly
2. TVHeadend needs restart after privilege changes
3. Network prefix restricting access

**Solutions:**
1. Re-save user configuration in web UI
2. Restart TVHeadend: `systemctl restart tvheadend`
3. Check access logs: `/var/log/tvheadend.log`
4. Temporarily remove network prefix restriction

## Additional Resources

- [TVHeadend Documentation](https://docs.tvheadend.org/)
- [HTTP Basic Authentication RFC 7617](https://tools.ietf.org/html/rfc7617)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
