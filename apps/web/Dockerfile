# --- Stage 1: Build Environment ---
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db/package.json ./packages/db/
COPY apps/web/package.json ./apps/web/

RUN apk add --no-cache git

RUN pnpm install --frozen-lockfile

COPY packages/db ./packages/db
COPY apps/web ./apps/web

RUN pnpm --filter @dn-debrief/db build
RUN pnpm --filter @dn-debrief/web build

# --- Stage 2: Unified Production Runtime Runner ---
FROM node:24-alpine AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production

# 1. 👇 Copy the compiled Nuxt output directly into a root .output folder
COPY --from=builder /app/apps/web/.output ./.output

# 2. Copy migrations, package definitions, and configuration files for the runtime migrator
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=builder /app/packages/db ./packages/db

RUN pnpm install --prod --frozen-lockfile

EXPOSE 3000

# 3. 👇 Execute straight from the root .output directory
CMD ["node", ".output/server/index.mjs"]