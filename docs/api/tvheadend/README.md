# TVHeadend API Documentation

Comprehensive OpenAPI 3.1 specification and documentation for the TVHeadend JSON API.

## What is TVHeadend?

[TVHeadend](https://tvheadend.org/) is a TV streaming server for Linux supporting multiple input sources (DVB-S, DVB-T, DVB-C, IPTV, etc.). It provides:

- **Live TV streaming** via HTTP, HTSP, and SAT>IP protocols
- **Electronic Program Guide (EPG)** from multiple sources
- **Digital Video Recording (DVR)** with series/keyword recording
- **Multi-user support** with fine-grained access control
- **Web interface** for configuration and management

This documentation covers TVHeadend's JSON API for programmatic access to these features.

## What's in This Documentation

### 📘 [OpenAPI Specification](./openapi.yaml)

Machine-readable API specification in OpenAPI 3.1 format. Use this for:
- Generating client code (TypeScript, Python, Go, etc.)
- API validation and testing
- Interactive API exploration (Swagger UI, Redoc)

**View with:**
```bash
# From project root - Generate HTML documentation
pnpm run docs:build

# Serve interactive documentation with live reload
pnpm run docs:serve
# Open http://localhost:8080
```

### 📖 Guides

Comprehensive guides for common topics:

- **[Authentication Guide](./guides/authentication.md)** - HTTP Basic Auth setup, privilege system, security best practices
- **[Pagination Guide](./guides/pagination.md)** - Working with grid responses, handling large datasets
- **[Filtering Guide](./guides/filtering.md)** - Complex filtering, search queries, field operators
- **[Error Handling Guide](./guides/errors.md)** - HTTP status codes, error responses, recovery strategies

### 💡 Examples

Ready-to-use code examples:

**Shell Scripts:**
- [Channel Operations](./examples/curl/channel-operations.sh) - List, search, and filter channels
- [DVR Recording](./examples/curl/dvr-recording.sh) - Schedule recordings, manage DVR
- [EPG Queries](./examples/curl/epg-queries.sh) - Query program guide, search shows

**Use Case Walkthroughs:**
- [01 - List Channels](./examples/use-cases/01-list-channels.md) - Complete channel list implementation
- [02 - Schedule Recording](./examples/use-cases/02-schedule-recording.md) - One-click recording from EPG
- [03 - Query Program Guide](./examples/use-cases/03-query-program-guide.md) - Build EPG grid view

### 🔍 API Reference

Detailed endpoint documentation organized by category:

- **[EPG Endpoints](./paths/epg.yaml)** - Program guide queries, event details
- **[Channel Endpoints](./paths/channel.yaml)** - Channel management, tags
- **[DVR Endpoints](./paths/dvr.yaml)** - Recording management, auto-rec rules
- **[Config Endpoints](./paths/config.yaml)** - System configuration (admin only)
- **[Status Endpoints](./paths/status.yaml)** - Server health, monitoring

## Quick Start

### 1. Setup Authentication

Create a user in TVHeadend with appropriate privileges:

```bash
# Open TVHeadend UI
open http://localhost:9981

# Navigate to: Configuration → Users → Access Entries
# Create user with 'streaming' and 'recording' privileges
```

### 2. Test Connection

```bash
# Test with curl
curl -u username:password \
  http://localhost:9981/api/serverinfo | jq '.'

# Expected response
{
  "name": "TVHeadend",
  "version": "4.3.2024",
  "api_version": 18
}
```

### 3. Query EPG

```bash
# Get currently airing programs
curl -u username:password \
  'http://localhost:9981/api/epg/events/grid?mode=now&limit=10' | jq '.'
```

### 4. List Channels

```bash
# Get all channels sorted by number
curl -u username:password \
  'http://localhost:9981/api/channel/grid?sort=number&dir=ASC&limit=50' | jq '.'
```

### 5. Schedule Recording

```bash
# Find a program
EVENT_ID=$(curl -s -u username:password \
  'http://localhost:9981/api/epg/events/grid?limit=1' | \
  jq -r '.entries[0].eventId')

# Schedule recording
curl -u username:password -X POST \
  -H "Content-Type: application/json" \
  -d "{\"event_id\":$EVENT_ID}" \
  'http://localhost:9981/api/dvr/entry/create_by_event'
```

## Key Concepts

### Grid Pattern

Most TVHeadend endpoints use a consistent "grid" pattern for paginated data:

```json
{
  "entries": [...],  // Array of items
  "total": 142,      // Total count (all pages)
  "start": 0,        // Current offset
  "limit": 50        // Page size
}
```

**Learn more:** [Pagination Guide](./guides/pagination.md)

### Filtering

Complex filtering supported via JSON filter parameter:

```bash
# Simple string search
?filter=news

# Field-specific filter
?filter={"field":"channelname","type":"string","value":"BBC"}

# Multiple conditions (AND logic)
?filter=[
  {"field":"channelname","type":"string","value":"BBC"},
  {"field":"start","type":"numeric","value":1704067200,"comparison":"gte"}
]
```

**Learn more:** [Filtering Guide](./guides/filtering.md)

### Authentication

HTTP Basic Authentication required for all API requests:

```bash
curl -u username:password http://localhost:9981/api/...
```

**Privilege levels:**
- `admin` - Full access
- `streaming` - View EPG, channels
- `recording` - Schedule recordings
- `htsp_streaming` - HTSP streaming access

**Learn more:** [Authentication Guide](./guides/authentication.md)

## Common Use Cases

### Building an EPG Application

1. [List and display channels](./examples/use-cases/01-list-channels.md)
2. [Query program guide data](./examples/use-cases/03-query-program-guide.md)
3. [Schedule recordings](./examples/use-cases/02-schedule-recording.md)

### Monitoring & Automation

- Check server status: `GET /api/status`
- Monitor recordings: `GET /api/dvr/entry/grid?status=recording`
- Auto-record by keywords: `POST /api/dvr/autorec/create`
- View system logs: `GET /api/log`

### Data Export

- Export channel list to CSV
- Generate weekly EPG schedule
- Backup recording configuration
- Generate usage reports

See [examples/](./examples/) for complete implementations.

## API Stability Warning

⚠️ **Important:** TVHeadend's API is **not officially documented or versioned** by the project. This documentation is reverse-engineered and may not cover all endpoints or edge cases.

**Recommendations:**
- Pin your TVHeadend version in production
- Test thoroughly before upgrading TVHeadend
- Implement defensive error handling
- Monitor for breaking changes in new releases
- Contribute improvements to this documentation

**Known compatibility:**
- TVHeadend 4.2.x ✓ (Core APIs stable)
- TVHeadend 4.3.x ✓ (Tested, minor additions)
- TVHeadend 4.4+ ⚠️ (Test before deployment)

## Project Structure

```
docs/api/tvheadend/
├── openapi.yaml              # Main OpenAPI spec
├── README.md                 # This file
├── components/               # Reusable OpenAPI components
│   ├── schemas/             # Data models
│   ├── parameters/          # Query parameters
│   ├── responses/           # Response definitions
│   ├── examples/            # Example data
│   └── security-schemes.yaml
├── paths/                    # API endpoint definitions
│   ├── epg.yaml
│   ├── channel.yaml
│   ├── dvr.yaml
│   ├── config.yaml
│   └── status.yaml
├── guides/                   # Documentation guides
│   ├── authentication.md
│   ├── pagination.md
│   ├── filtering.md
│   └── errors.md
└── examples/                 # Code examples
    ├── curl/                # Shell scripts
    └── use-cases/           # Walkthrough tutorials
```

## Tools & Validation

### Validate OpenAPI Spec

```bash
# From project root
pnpm run validate:openapi
```

### Generate Client Code

**TypeScript:**
```bash
npm install -g @openapitools/openapi-generator-cli

openapi-generator-cli generate \
  -i docs/api/tvheadend/openapi.yaml \
  -g typescript-axios \
  -o src/generated/tvheadend-client
```

**Python:**
```bash
pip install openapi-generator-cli

openapi-generator-cli generate \
  -i docs/api/tvheadend/openapi.yaml \
  -g python \
  -o tvheadend_client
```

**Go:**
```bash
openapi-generator-cli generate \
  -i docs/api/tvheadend/openapi.yaml \
  -g go \
  -o tvheadend-client
```

### Interactive Documentation

**Redoc (recommended):**
```bash
# From project root
pnpm run docs:serve
# Open http://localhost:8080

# With live reload during development
pnpm run docs:watch
```

**Build static HTML:**
```bash
# From project root
pnpm run docs:build
# Generates: docs/api/tvheadend/api-docs.html
```

**Swagger UI (optional):**
```bash
docker run -p 8081:8080 \
  -e SWAGGER_JSON=/openapi.yaml \
  -v $(pwd)/docs/api/tvheadend/openapi.yaml:/openapi.yaml \
  swaggerapi/swagger-ui
# Open http://localhost:8081
```

## Contributing

This documentation is part of the tvh-guide-ng project. Contributions welcome!

**How to contribute:**
1. Fork the repository
2. Add/improve documentation
3. Validate with `pnpm run validate:openapi`
4. Submit pull request

**What to contribute:**
- New endpoint documentation
- Code examples in other languages
- Error scenarios and solutions
- Performance tips
- Real-world use cases

## Related Resources

### TVHeadend

- [Official Website](https://tvheadend.org/)
- [Official Documentation](https://docs.tvheadend.org/)
- [GitHub Repository](https://github.com/tvheadend/tvheadend)
- [Forum](https://tvheadend.org/projects/tvheadend/boards)

### OpenAPI

- [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0)
- [Spectral OpenAPI Linter](https://stoplight.io/open-source/spectral)
- [Redoc Documentation Generator](https://github.com/Redocly/redoc)
- [OpenAPI Generator](https://openapi-generator.tech/)

### This Project

- [Main README](../../README.md)
- [Project Structure](../../STRUCTURE.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)

## License

This documentation is part of the tvh-guide-ng project and is licensed under the same terms as the project.

TVHeadend is licensed under GPL-3.0. This documentation is independently created and not officially endorsed by the TVHeadend project.

## Version

- **Documentation Version:** 1.0.0
- **TVHeadend Compatibility:** 4.2.x, 4.3.x
- **Last Updated:** 2024-01-01

---

**Need Help?**
- Check the [guides](./guides/) for common topics
- Browse [examples](./examples/) for code samples
- Search the [OpenAPI spec](./openapi.yaml) for specific endpoints
- Open an issue on GitHub for bugs/questions
