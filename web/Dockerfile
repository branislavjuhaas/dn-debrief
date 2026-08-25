# syntax=docker/dockerfile:1

# --- STAGE 1: Build Stage ---
FROM ghcr.io/voidzero-dev/vite-plus:latest AS build
WORKDIR /app

# 1. Install dependencies
COPY --chown=vp:vp package.json pnpm-lock.yaml pnpm-workspace.yaml* .node-version* ./
RUN vp install --frozen-lockfile

# 2. Copy source files and build the Nuxt application
COPY --chown=vp:vp . .
RUN vp run build

# --- STAGE 2: Database Migration Drivers ---
FROM ghcr.io/voidzero-dev/vite-plus:latest AS db-deps
WORKDIR /app
RUN npm install postgres drizzle-orm@1.0.0-rc.3 --omit=dev --no-audit --no-fund

# --- STAGE 3: Minimal Node Runtime ---
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Install missing shared runtime library
RUN apt-get update && apt-get install -y --no-install-recommends libatomic1 && rm -rf /var/lib/apt/lists/*

# Copy database migration files & runner script
COPY --from=build /app/server/db/migrations ./migrations
COPY --from=build /app/server/db/migrate.mjs ./migrate.mjs
COPY --from=db-deps /app/node_modules ./node_modules/

# Copy compiled Nuxt standalone output directory
COPY --from=build /app/.output ./.output

USER node
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]