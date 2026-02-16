# ── Stage 1: Dependencies ──────────────────────────────────────────
FROM node:24-slim AS deps

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

# better-sqlite3 needs build tools for native compilation
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy workspace config and shared tsconfig
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy package.json files for the service and its workspace dependency
COPY services/epg-cache/package.json services/epg-cache/package.json
COPY libs/tvheadend-client/package.json libs/tvheadend-client/package.json

# Install all dependencies (including devDependencies for the build)
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ─────────────────────────────────────────────────
FROM deps AS build

# Copy source code
COPY libs/tvheadend-client/ libs/tvheadend-client/
COPY services/epg-cache/ services/epg-cache/

# Build the library first, then the service
RUN pnpm --filter @tvh-guide/tvheadend-client build \
    && pnpm --filter @tvh-guide/epg-cache build

# Create a production-only deployment bundle using pnpm deploy
RUN pnpm --filter @tvh-guide/epg-cache deploy --prod --legacy /app/deployed

# ── Stage 3: Runtime ───────────────────────────────────────────────
FROM node:24-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

# Copy the production deployment bundle (includes dist + prod node_modules
# with the pre-compiled native better-sqlite3 binary)
COPY --from=build /app/deployed/node_modules node_modules/
COPY --from=build /app/deployed/dist dist/
COPY --from=build /app/deployed/package.json .

# Create data directory for SQLite
RUN mkdir -p /data

ENV EPG_SQLITE_PATH=/data/epg-cache.db

EXPOSE 3000
VOLUME ["/data"]

CMD ["node", "dist/index.js"]
