# TVHeadend CLI

Command-line interface for managing TVHeadend EPG (Electronic Program Guide) and recordings.

## Features

- 🔐 **Authentication** - Interactive login and configuration management
- 📺 **Channels** - Browse, search, and manage channels
- 📅 **EPG Events** - Search and view electronic program guide
- 🎬 **DVR** - Schedule, manage, and monitor recordings
- 🖥️ **Server** - View server information and active connections
- 🎨 **Multiple Output Formats** - Table view or JSON output
- ⚙️ **Flexible Configuration** - Config file or command-line flags

## Installation

### Global Installation

```bash
npm install -g @tvh-guide/cli
```

### Local Development

```bash
# From monorepo root
pnpm install
pnpm --filter @tvh-guide/cli build

# Link globally for testing
cd apps/cli
pnpm link --global
```

## Quick Start

### 1. Configure Connection

**Option A: Interactive Setup**

```bash
tvh auth login
```

This will prompt for your TVHeadend server URL, username, and password, then save the configuration to `~/.tvhrc`.

**Option B: Create Config File**

Create `~/.tvhrc`:

```json
{
  "server": {
    "url": "http://localhost:9981",
    "username": "admin",
    "password": "secret"
  },
  "defaults": {
    "format": "table",
    "limit": 50,
    "color": true
  }
}
```

**Option C: Use Command-Line Flags**

```bash
tvh --url http://localhost:9981 --username admin --password secret channels list
```

### 2. Test Connection

```bash
tvh auth status
```

### 3. Browse Channels

```bash
tvh channels list
```

## Command Reference

### Global Options

All commands support these global options:

- `--url <url>` - TVHeadend server URL (overrides config)
- `--username <user>` - Username (overrides config)
- `--password <pass>` - Password (overrides config)
- `--json` - Output as JSON
- `--format <type>` - Output format: table, json
- `--quiet` - Minimal output (no spinners, colors)
- `--verbose` - Detailed output with debug info
- `--no-color` - Disable colors
- `--help` - Show help for any command

### Authentication Commands

#### Login

Interactive login that saves credentials to config file:

```bash
tvh auth login
```

#### Status

Test connection and show server information:

```bash
tvh auth status
```

#### Config

Show configuration file location:

```bash
tvh auth config
```

### Channel Commands

#### List Channels

```bash
# List all channels
tvh channels list

# Sort by name
tvh channels list --sort name

# Filter by channel tag UUID
tvh channels list --tag abc123-def456

# Limit results
tvh channels list --limit 10

# JSON output
tvh channels list --json
```

#### Search Channels

```bash
# Search by name
tvh channels search "HBO"

# Search with JSON output
tvh channels search "ESPN" --json
```

#### List Channel Tags

```bash
tvh channels tags
```

#### Show Channel Details

```bash
# By UUID
tvh channels show abc123-def456

# By channel number
tvh channels show 101
```

### EPG Events Commands

#### List Events

```bash
# List upcoming events (default: 20)
tvh events list

# Show currently airing events
tvh events list --now

# Show upcoming events only
tvh events list --upcoming

# Filter by channel (by number or UUID)
tvh events list --channel 101

# Limit results
tvh events list --limit 50

# Sort by title
tvh events list --sort title
```

#### Search Events

```bash
# Search by title
tvh events search "News"

# Search with genre filter
tvh events search "Movie" --genre 16

# Search upcoming events only
tvh events search "Sports" --upcoming

# Limit search results
tvh events search "Series" --limit 10
```

#### Show Event Details

```bash
tvh events show 12345
```

#### List Genres

```bash
tvh events genres
```

### DVR (Recording) Commands

#### List Recordings

```bash
# List all recordings
tvh dvr list

# Filter by status
tvh dvr list --status upcoming
tvh dvr list --status recording
tvh dvr list --status finished
tvh dvr list --status failed

# Sort by title
tvh dvr list --sort title

# Limit results
tvh dvr list --limit 10
```

#### Schedule Recording

```bash
# Schedule recording from EPG event
tvh dvr schedule 12345

# With priority (0-6, default: 2)
tvh dvr schedule 12345 --priority 4

# With specific DVR profile
tvh dvr schedule 12345 --profile "HDTV Profile"
```

#### Cancel Recording

```bash
# Cancel scheduled recording (with confirmation)
tvh dvr cancel abc123-def456

# Skip confirmation
tvh dvr cancel abc123-def456 --yes
```

#### Stop Recording

```bash
# Stop active recording (with confirmation)
tvh dvr stop abc123-def456

# Skip confirmation
tvh dvr stop abc123-def456 --yes
```

#### Remove Recording

```bash
# Remove/delete recording (with confirmation)
tvh dvr remove abc123-def456

# Skip confirmation
tvh dvr remove abc123-def456 --yes
```

### Server Commands

#### Server Information

```bash
# Show server info
tvh server info

# JSON output
tvh server info --json
```

#### Active Connections

```bash
# Show active connections
tvh server connections

# JSON output
tvh server connections --json
```

## Configuration

### Configuration File Locations

The CLI searches for configuration in the following order:

1. `.tvhrc` (current directory)
2. `~/.tvhrc` (home directory)
3. `tvh.config.js` (current directory)
4. `package.json` with `"tvh"` field

### Configuration Format

**JSON Format (`.tvhrc`):**

```json
{
  "server": {
    "url": "http://localhost:9981",
    "username": "admin",
    "password": "secret"
  },
  "defaults": {
    "format": "table",
    "limit": 50,
    "color": true
  }
}
```

**JavaScript Format (`tvh.config.js`):**

```javascript
module.exports = {
  server: {
    url: 'http://localhost:9981',
    username: 'admin',
    password: 'secret',
  },
  defaults: {
    format: 'table',
    limit: 50,
    color: true,
  },
};
```

**package.json:**

```json
{
  "tvh": {
    "server": {
      "url": "http://localhost:9981",
      "username": "admin",
      "password": "secret"
    }
  }
}
```

### Configuration Precedence

Command-line flags always override configuration file settings:

```bash
# Uses password from CLI, everything else from config file
tvh --password newpass channels list
```

## Output Formats

### Table Output (Default)

```bash
tvh channels list
```

```
┌──────────┬─────────────────────────────────┬───────────┬──────────────────────────────────────┐
│ Number   │ Name                            │ Enabled   │ UUID                                 │
├──────────┼─────────────────────────────────┼───────────┼──────────────────────────────────────┤
│ 101      │ HBO                             │ Yes       │ abc123-def456-ghi789                 │
│ 102      │ ESPN                            │ Yes       │ xyz987-uvw654-rst321                 │
└──────────┴─────────────────────────────────┴───────────┴──────────────────────────────────────┘

Total: 2 channels
```

### JSON Output

```bash
tvh channels list --json
```

```json
[
  {
    "number": 101,
    "name": "HBO",
    "enabled": true,
    "uuid": "abc123-def456-ghi789"
  },
  {
    "number": 102,
    "name": "ESPN",
    "enabled": true,
    "uuid": "xyz987-uvw654-rst321"
  }
]
```

## Troubleshooting

### Connection Refused

**Error:** `Could not connect to TVHeadend server`

**Solutions:**
1. Verify the server URL is correct: `tvh auth status`
2. Check that TVHeadend is running
3. Ensure the port (default: 9981) is accessible
4. Try using the full URL with protocol: `http://localhost:9981`

### Authentication Failed

**Error:** `Authentication failed`

**Solutions:**
1. Check your username and password in the config file
2. Try re-running the login: `tvh auth login`
3. Verify credentials work in the TVHeadend web interface
4. Use `--username` and `--password` flags to test

### Server URL Required

**Error:** `Server URL is required`

**Solutions:**
1. Run interactive setup: `tvh auth login`
2. Create a configuration file at `~/.tvhrc`
3. Use `--url` flag: `tvh --url http://localhost:9981 <command>`

### No Configuration Found

**Error:** `No configuration file found`

**Solutions:**
1. Run `tvh auth login` to create configuration interactively
2. Manually create `~/.tvhrc` (see Configuration section)
3. Use command-line flags for connection details

## Examples

### Common Workflows

**Find and record a show:**

```bash
# Search for the show
tvh events search "Breaking Bad"

# Get the event ID from the results, then schedule it
tvh dvr schedule 12345
```

**View what's recording now:**

```bash
tvh dvr list --status recording
```

**Check server status:**

```bash
tvh auth status
tvh server info
tvh server connections
```

**Browse channels and current programs:**

```bash
tvh channels list
tvh events list --now
```

## Development

### Building

```bash
pnpm --filter @tvh-guide/cli build
```

### Running Locally

```bash
# Without building
pnpm --filter @tvh-guide/cli dev

# After building
node apps/cli/dist/cli.js --help
```

### Testing

```bash
pnpm --filter @tvh-guide/cli test
```

## License

See the main project LICENSE file.

## Related

- [@tvh-guide/tvheadend-client](../../libs/tvheadend-client) - TypeScript client library
- [TVHeadend Documentation](https://tvheadend.org/projects/tvheadend/wiki)

## Support

For issues and feature requests, please use the GitHub issue tracker.
