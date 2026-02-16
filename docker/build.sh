#!/usr/bin/env bash
set -euo pipefail

# Build Docker images for tvh-guide-ng services.
# Run from the repository root: ./docker/build.sh

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TAG="latest"
SERVICE=""
EPG_CACHE_URL="http://epg-cache:3000"

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Build Docker images for tvh-guide-ng services.

Options:
  --tag TAG                Docker image tag (default: latest)
  --service NAME           Build only this service: web | epg-cache
  --epg-cache-url URL      PUBLIC_EPG_CACHE_URL for the web build
                           (default: http://epg-cache:3000)
  -h, --help               Show this help message

Examples:
  ./docker/build.sh                          # Build all images
  ./docker/build.sh --tag v1.0.0             # Build with specific tag
  ./docker/build.sh --service web            # Build only web
  ./docker/build.sh --service epg-cache      # Build only epg-cache
EOF
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag)        TAG="$2";            shift 2 ;;
    --service)    SERVICE="$2";        shift 2 ;;
    --epg-cache-url) EPG_CACHE_URL="$2"; shift 2 ;;
    -h|--help)    usage ;;
    *)            echo "Unknown option: $1"; usage ;;
  esac
done

build_web() {
  echo "==> Building tvh-guide-web:${TAG}"
  docker build \
    -f docker/web/Dockerfile \
    --build-arg "PUBLIC_EPG_CACHE_URL=${EPG_CACHE_URL}" \
    -t "tvh-guide-web:${TAG}" \
    "${REPO_ROOT}"
  echo "==> tvh-guide-web:${TAG} built successfully"
}

build_epg_cache() {
  echo "==> Building tvh-guide-epg-cache:${TAG}"
  docker build \
    -f docker/epg-cache/Dockerfile \
    -t "tvh-guide-epg-cache:${TAG}" \
    "${REPO_ROOT}"
  echo "==> tvh-guide-epg-cache:${TAG} built successfully"
}

cd "${REPO_ROOT}"

case "${SERVICE}" in
  web)       build_web ;;
  epg-cache) build_epg_cache ;;
  "")        build_epg_cache; build_web ;;
  *)         echo "Unknown service: ${SERVICE}"; exit 1 ;;
esac

echo ""
echo "Done. Built images:"
docker images --format "  {{.Repository}}:{{.Tag}}  {{.Size}}" | grep tvh-guide || true
