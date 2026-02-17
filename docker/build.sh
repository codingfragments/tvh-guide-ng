#!/usr/bin/env bash
set -euo pipefail

# Build Docker images for tvh-guide-ng services.
# Run from the repository root: ./docker/build.sh

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Ensure Docker Desktop credential helpers are on PATH (macOS / Windows)
for dir in \
  "/Applications/Docker.app/Contents/Resources/bin" \
  "$HOME/.docker/bin" \
  "/usr/local/lib/docker/cli-plugins"; do
  if [[ -d "${dir}" ]] && [[ ":${PATH}:" != *":${dir}:"* ]]; then
    export PATH="${dir}:${PATH}"
  fi
done

TAG="latest"
SERVICE=""
REGISTRY=""
EPG_CACHE_URL="http://epg-cache:3000"
PLATFORMS=""
PUSH=false
BUILDER_NAME="tvh-guide-builder"

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Build Docker images for tvh-guide-ng services.

Options:
  --tag TAG                Docker image tag (default: latest)
  --service NAME           Build only this service: web | epg-cache
  --registry REGISTRY      Registry prefix for image names
                           (e.g. ghcr.io/codingfragments)
  --epg-cache-url URL      PUBLIC_EPG_CACHE_URL for the web build
                           (default: http://epg-cache:3000)
  --platform PLATFORMS     Target platforms (default: current architecture)
                           Use "all" for linux/amd64,linux/arm64
                           Or specify explicitly: linux/amd64,linux/arm64
  --push                   Push images to registry (required for multi-platform)
  -h, --help               Show this help message

Examples:
  ./docker/build.sh                              # Build for current arch
  ./docker/build.sh --tag v1.0.0                 # Build with specific tag
  ./docker/build.sh --service web                # Build only web
  ./docker/build.sh --platform all --push        # Multi-arch, push to registry
  ./docker/build.sh --platform linux/amd64       # Build for Intel only

  # Push to GitHub Container Registry:
  ./docker/build.sh --registry ghcr.io/codingfragments --platform all --push

  # Push to Docker Hub:
  ./docker/build.sh --registry docker.io/myuser --push --tag v1.0.0
EOF
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag)            TAG="$2";            shift 2 ;;
    --service)        SERVICE="$2";        shift 2 ;;
    --registry)       REGISTRY="$2";       shift 2 ;;
    --epg-cache-url)  EPG_CACHE_URL="$2";  shift 2 ;;
    --platform)       PLATFORMS="$2";      shift 2 ;;
    --push)           PUSH=true;           shift ;;
    -h|--help)        usage ;;
    *)                echo "Unknown option: $1"; usage ;;
  esac
done

# Resolve "all" shorthand
if [[ "${PLATFORMS}" == "all" ]]; then
  PLATFORMS="linux/amd64,linux/arm64"
fi

# Build the full image name with optional registry prefix
image_name() {
  local name="$1"
  if [[ -n "${REGISTRY}" ]]; then
    echo "${REGISTRY}/${name}"
  else
    echo "${name}"
  fi
}

WEB_IMAGE="$(image_name "tvh-guide-web")"
EPG_CACHE_IMAGE="$(image_name "tvh-guide-epg-cache")"

# Ensure a buildx builder exists for multi-platform builds
ensure_builder() {
  if [[ -z "${PLATFORMS}" ]]; then
    return
  fi

  if ! docker buildx inspect "${BUILDER_NAME}" &>/dev/null; then
    echo "==> Creating buildx builder: ${BUILDER_NAME}"
    docker buildx create --name "${BUILDER_NAME}" --driver docker-container --bootstrap
  fi
}

build_web() {
  local -a args=(
    -f docker/web/Dockerfile
    --build-arg "PUBLIC_EPG_CACHE_URL=${EPG_CACHE_URL}"
    -t "${WEB_IMAGE}:${TAG}"
  )

  if [[ -n "${PLATFORMS}" ]]; then
    echo "==> Building ${WEB_IMAGE}:${TAG} for ${PLATFORMS}"
    args+=(--platform "${PLATFORMS}" --builder "${BUILDER_NAME}")
    if [[ "${PUSH}" == true ]]; then
      args+=(--push)
    else
      args+=(--output "type=image,push=false")
    fi
    docker buildx build "${args[@]}" "${REPO_ROOT}"
  else
    echo "==> Building ${WEB_IMAGE}:${TAG}"
    docker build "${args[@]}" "${REPO_ROOT}"
  fi

  echo "==> ${WEB_IMAGE}:${TAG} built successfully"
}

build_epg_cache() {
  local -a args=(
    -f docker/epg-cache/Dockerfile
    -t "${EPG_CACHE_IMAGE}:${TAG}"
  )

  if [[ -n "${PLATFORMS}" ]]; then
    echo "==> Building ${EPG_CACHE_IMAGE}:${TAG} for ${PLATFORMS}"
    args+=(--platform "${PLATFORMS}" --builder "${BUILDER_NAME}")
    if [[ "${PUSH}" == true ]]; then
      args+=(--push)
    else
      args+=(--output "type=image,push=false")
    fi
    docker buildx build "${args[@]}" "${REPO_ROOT}"
  else
    echo "==> Building ${EPG_CACHE_IMAGE}:${TAG}"
    docker build "${args[@]}" "${REPO_ROOT}"
  fi

  echo "==> ${EPG_CACHE_IMAGE}:${TAG} built successfully"
}

cd "${REPO_ROOT}"
ensure_builder

case "${SERVICE}" in
  web)       build_web ;;
  epg-cache) build_epg_cache ;;
  "")        build_epg_cache; build_web ;;
  *)         echo "Unknown service: ${SERVICE}"; exit 1 ;;
esac

echo ""
echo "Done. Built images:"
if [[ -n "${PLATFORMS}" ]]; then
  echo "  Platforms: ${PLATFORMS}"
  if [[ "${PUSH}" == true ]]; then
    [[ -z "${SERVICE}" || "${SERVICE}" == "web" ]] \
      && docker buildx imagetools inspect "${WEB_IMAGE}:${TAG}" 2>/dev/null || true
    [[ -z "${SERVICE}" || "${SERVICE}" == "epg-cache" ]] \
      && docker buildx imagetools inspect "${EPG_CACHE_IMAGE}:${TAG}" 2>/dev/null || true
  fi
else
  docker images --format "  {{.Repository}}:{{.Tag}}  {{.Size}}" | grep tvh-guide || true
fi
