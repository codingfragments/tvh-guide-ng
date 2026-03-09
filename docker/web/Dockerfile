# ── Stage 1: Dependencies ──────────────────────────────────────────
FROM node:24-slim AS deps

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json ./

# Copy package.json files for web and required workspace libraries
COPY apps/web/package.json apps/web/package.json
COPY libs/epg-cache-client/package.json libs/epg-cache-client/package.json
COPY libs/tvheadend-client/package.json libs/tvheadend-client/package.json

# Install all dependencies (including devDependencies for the build)
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ─────────────────────────────────────────────────
FROM deps AS build

# PUBLIC_ env vars are baked into the SvelteKit build
ARG PUBLIC_EPG_CACHE_URL=http://epg-cache:3000
ENV PUBLIC_EPG_CACHE_URL=${PUBLIC_EPG_CACHE_URL}

# Copy source code
COPY apps/web/ apps/web/
COPY libs/epg-cache-client/ libs/epg-cache-client/
COPY libs/tvheadend-client/ libs/tvheadend-client/

# Build workspace libraries first, then web app
RUN pnpm --filter @tvh-guide/tvheadend-client build \
    && pnpm --filter @tvh-guide/epg-cache-client build \
    && pnpm --filter @tvh-guide/web build

# ── Stage 3: Runtime ───────────────────────────────────────────────
FROM node:24-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

# SvelteKit adapter-node bundles all dependencies into the build output.
# Only the build folder and Node.js are needed at runtime.
COPY --from=build /app/apps/web/build build/
COPY --from=build /app/apps/web/package.json .

EXPOSE 3000

CMD ["node", "build/index.js"]
