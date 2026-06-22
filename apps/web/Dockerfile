# --- STAGE I: Build Environment ---
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy monorepo configuration files for dependency resolution
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.json ./
COPY packages/db/package.json ./packages/db/
COPY apps/web/package.json ./apps/web/

# Install all dependencies (including devDependencies like tsdown and drizzle-kit)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source trees
COPY packages/db ./packages/db
COPY apps/web ./apps/web

# Set environment variables for Sentry DSN
ARG SENTRY_DSN
ARG SENTRY_AUTH_TOKEN

ENV SENTRY_DSN=$SENTRY_DSN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

# Build both database tools and the web application
RUN pnpm --filter @dn-debrief/db build
RUN pnpm --filter @dn-debrief/web build

# --- STAGE II: Sane, Flat Production Runtime Runner ---
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install only raw production drivers needed for the micro-migration script
RUN npm install postgres drizzle-orm@1.0.0-rc.3 --omit=dev --no-audit --no-fund && npm cache clean --force

# 1. Copy raw SQL migration files to a flat root directory
COPY --from=builder /app/packages/db/migrations ./migrations

# 2. Copy the tsdown-compiled migration script directly into the root
COPY --from=builder /app/packages/db/dist/migrate.mjs ./migrate.mjs

# 3. Copy the standalone compiled Nuxt 4 server bundle
COPY --from=builder /app/apps/web/.output ./.output

EXPOSE 3000

# Default execution targeted at the web core
CMD ["node", ".output/server/index.mjs"]
