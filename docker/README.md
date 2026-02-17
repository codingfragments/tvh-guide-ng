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
./docker/build.sh                              # Build all images (current arch)
./docker/build.sh --tag v1.0.0                 # Build with a specific tag
./docker/build.sh --service web                # Build only the web image
./docker/build.sh --service epg-cache          # Build only the epg-cache image
```

### Build script options

| Flag | Description | Default |
|------|-------------|---------|
| `--tag TAG` | Docker image tag | `latest` |
| `--service NAME` | Build only `web` or `epg-cache` | both |
| `--registry REGISTRY` | Registry prefix (e.g. `ghcr.io/codingfragments`) | local only |
| `--epg-cache-url URL` | `PUBLIC_EPG_CACHE_URL` baked into the web build | `http://epg-cache:3000` |
| `--platform PLATFORMS` | Target platforms (`all`, or e.g. `linux/amd64,linux/arm64`) | current arch |
| `--push` | Push images to the registry | off |

### Multi-architecture builds

Build images for both ARM (Apple Silicon, Raspberry Pi) and Intel/AMD simultaneously:

```bash
# Build for both architectures (images stay local in buildx cache)
./docker/build.sh --platform all

# Build for a single target architecture
./docker/build.sh --platform linux/amd64       # Intel/AMD only
./docker/build.sh --platform linux/arm64       # ARM only
```

The script automatically creates a Docker Buildx builder with QEMU emulation support on first use. Multi-platform images require either `--push` to a registry or will be kept in the buildx cache (not loaded into the local Docker image list).

### Pushing to a container registry

Use `--registry` to prefix image names with a registry path, and `--push` to upload:

```bash
# GitHub Container Registry (ghcr.io)
docker login ghcr.io -u YOUR_USERNAME
./docker/build.sh --registry ghcr.io/codingfragments --platform all --push --tag v1.0.0

# Docker Hub
docker login
./docker/build.sh --registry docker.io/myuser --push --tag v1.0.0
```

This produces images like `ghcr.io/codingfragments/tvh-guide-web:v1.0.0` with manifests for both `linux/amd64` and `linux/arm64`.

Without `--registry`, images are tagged locally as `tvh-guide-web` and `tvh-guide-epg-cache`.

### Using Docker Compose

```bash
cd docker
docker compose build
```

### Using pre-built images

If images have been pushed to a registry, you can skip building and pull them directly. Set the `IMAGE_REGISTRY` and `IMAGE_TAG` variables in your `.env`:

```env
IMAGE_REGISTRY=ghcr.io/codingfragments/
IMAGE_TAG=v1.0.0
```

Then use `docker compose pull && docker compose up -d` (no build step needed).

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
| `IMAGE_REGISTRY` | _(empty)_ | Registry prefix with trailing slash (e.g. `ghcr.io/codingfragments/`) |
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
