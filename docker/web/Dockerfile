# ── Stage 1: Dependencies ──────────────────────────────────────────
FROM node:24-slim AS deps

RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy only the web app's package.json
COPY apps/web/package.json apps/web/package.json

# Install all dependencies (including devDependencies for the build)
RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ─────────────────────────────────────────────────
FROM deps AS build

# PUBLIC_ env vars are baked into the SvelteKit build
ARG PUBLIC_EPG_CACHE_URL=http://epg-cache:3000
ENV PUBLIC_EPG_CACHE_URL=${PUBLIC_EPG_CACHE_URL}

# Copy source code
COPY apps/web/ apps/web/

RUN pnpm --filter @tvh-guide/web build

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
