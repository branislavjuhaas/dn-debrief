# --- Stage 1: Build Environment ---
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.json ./
COPY packages/db/package.json ./packages/db/
COPY apps/web/package.json ./apps/web/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY packages/db ./packages/db
COPY apps/web ./apps/web

RUN pnpm --filter @dn-debrief/db build
RUN pnpm --filter @dn-debrief/web build

# --- Stage 2: Unified Production Runtime Runner ---
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@latest --activate

# 1. Monorepo structural files
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# 2. Copy ONLY the db metadata and SQL migrations (No raw TypeScript source files!)
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/packages/db/migrations ./packages/db/migrations
COPY --from=builder /app/packages/db/drizzle.config.ts ./packages/db/

# 3. Copy the compiled standalone Nuxt 4 server bundle
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/.output ./apps/web/.output

# 4. Install only production-grade engines/binaries
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

EXPOSE 3000

# Start your unified web application
CMD ["node", "apps/web/.output/server/index.mjs"]