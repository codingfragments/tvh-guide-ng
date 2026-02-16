# Docker Deployment

Run the tvh-guide-ng EPG guide with Docker Compose — no Node.js installation required.

## Quick Start

```bash
cd docker

# Create your environment file
cp .env.example .env
# Edit .env — at minimum set TVH_URL to your TVHeadend instance

# Build and start
docker compose up -d

# View logs
docker compose logs -f
```

The web UI will be available at <http://localhost:8080> and the EPG Cache API at <http://localhost:3100>.

## Building Images

### Using the build script

```bash
# From the repository root:
./docker/build.sh                        # Build all images
./docker/build.sh --tag v1.0.0           # Build with a specific tag
./docker/build.sh --service web          # Build only the web image
./docker/build.sh --service epg-cache    # Build only the epg-cache image
```

### Using Docker Compose

```bash
cd docker
docker compose build
```

## Configuration Reference

### EPG Cache Service

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `TVH_URL` | Yes | — | TVHeadend instance URL (e.g. `http://192.168.1.10:9981`) |
| `TVH_USERNAME` | No | `""` | TVHeadend username |
| `TVH_PASSWORD` | No | `""` | TVHeadend password |
| `EPG_REFRESH_INTERVAL` | No | `3600` | Seconds between EPG syncs from TVHeadend |
| `EPG_SQLITE_PATH` | No | `/data/epg-cache.db` | SQLite database path inside the container |
| `PICON_PATH` | No | — | Path to picon images inside the container |

### Web Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PUBLIC_EPG_CACHE_URL` | No | `http://epg-cache:3000` | URL the browser uses to reach the EPG Cache API. **Build-time only** — baked into the SvelteKit build. |

### Compose-level Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EPG_CACHE_PORT` | `3100` | Host port for the EPG Cache API |
| `WEB_PORT` | `8080` | Host port for the web UI |
| `IMAGE_TAG` | `latest` | Docker image tag |

## Volumes & Persistence

### SQLite Data

The EPG Cache stores its database in a named Docker volume (`epg-data`) mounted at `/data` inside the container. This persists across container restarts and image updates.

```bash
# Inspect the volume
docker volume inspect docker_epg-data

# Back up the database
docker compose exec epg-cache cp /data/epg-cache.db /data/backup.db
docker cp "$(docker compose ps -q epg-cache)":/data/backup.db ./epg-cache-backup.db
```

### Picon Images

To serve channel logos (picons), mount a local directory into the epg-cache container:

```yaml
# In docker-compose.yml, under epg-cache → volumes:
- /path/to/your/picons:/picons:ro
```

Then set `PICON_PATH=/picons` in the epg-cache environment.

## Networking

### TVHeadend on the same host

If TVHeadend runs directly on the host machine:

```env
TVH_URL=http://host.docker.internal:9981
```

> `host.docker.internal` works on Docker Desktop (macOS/Windows). On Linux, add `extra_hosts: ["host.docker.internal:host-gateway"]` to the epg-cache service or use the host's LAN IP.

### TVHeadend in another Docker container

If TVHeadend runs in its own Docker Compose stack, connect via an external network:

```yaml
# In docker-compose.yml:
services:
  epg-cache:
    networks:
      - tvheadend_default

networks:
  tvheadend_default:
    external: true
```

Then use the TVHeadend container name as the host:

```env
TVH_URL=http://tvheadend:9981
```

### PUBLIC_EPG_CACHE_URL

This URL is used by the **browser** (not the server) to reach the EPG Cache API. It gets baked into the SvelteKit build at image build time.

- **Same host**: `http://localhost:3100` (or whatever `EPG_CACHE_PORT` you set)
- **Remote server**: `http://your-server-ip:3100`
- **Behind a reverse proxy**: `https://epg-api.example.com`

If you change this value, you must **rebuild** the web image.

## Customizing

For a full configuration template with all options documented inline:

```bash
cp docker-compose.template.yml docker-compose.yml
```

You can also create a `docker-compose.override.yml` for local customizations that won't be overwritten by updates.

## Troubleshooting

### SQLite Permission Errors

If epg-cache fails with a database permission error, ensure the `/data` volume is writable:

```bash
docker compose exec epg-cache ls -la /data
```

The container runs as root by default, so this should not typically be an issue.

### TVHeadend Connectivity

Verify the EPG Cache can reach TVHeadend:

```bash
docker compose exec epg-cache node -e "fetch('$TVH_URL/api/serverinfo').then(r => r.json()).then(console.log)"
```

### Rebuilding After Config Changes

Since `PUBLIC_EPG_CACHE_URL` is a build-time variable, changing it requires a rebuild:

```bash
docker compose build web
docker compose up -d web
```

Runtime environment variables (like `TVH_URL`) can be changed with a simple restart:

```bash
docker compose up -d
```
