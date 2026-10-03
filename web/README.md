# DN DebRIEF Web

The Nuxt web platform for [DN DebRIEF](../README.md) — a debate platform for the community of the Slovak Debate Association (SDA). This document covers setup, development, and deployment of the web project.

> The user-facing application is in Slovak. Code, documentation, and database identifiers are in English.

## Tech Stack

| Layer     | Technology                                                                                                      |
| --------- | --------------------------------------------------------------------------------------------------------------- |
| Framework | [Nuxt 4](https://nuxt.com) + Vue 3 (`<script setup lang="ts">`)                                                 |
| UI        | [Nuxt UI v4](https://ui.nuxt.com), Tailwind CSS v4, Motion V, Phosphor icons                                    |
| Backend   | [Nitro](https://nitro.build) server routes with runtime OpenAPI generation                                      |
| Database  | PostgreSQL 18 via [Drizzle ORM](https://orm.drizzle.team); embedded [PGlite](https://pglite.dev) in development |
| Auth      | [Better-Auth](https://better-auth.com) — email/password, Google, GitHub, admin plugin                           |
| Storage   | S3-compatible object storage ([RustFS](https://rustfs.com)) with presigned URLs; local files in development     |
| Email     | AWS SES; logged to the console in development                                                                   |
| Payments  | [Stripe](https://stripe.com) Checkout and webhooks                                                              |
| Toolchain | [Vite+](https://viteplus.dev) (`vp`), TypeScript, Golar, pnpm                                                   |

## Features

- **Events** — tournaments, workshops, and other events with rich-text descriptions (Tiptap), a schedule/agenda builder, thumbnails, motions, target league and region, and organizer management.
- **Registrations** — built-in or external registration forms. Organizers define registration roles (contestant / adjudicator / other) with fees, credential requirements, and team variants; questions support sections with conditional visibility. Soft and hard deadlines, legal-guardian confirmation for minors, per-event registration management, and Excel export.
- **Clubs & memberships** — club registry with managers, season-based memberships (junior/senior student, graduate, teacher), membership confirmation, and payments.
- **Profiles & credentials** — user profiles with credentials, awards, club memberships, event registrations, and payment history.
- **Payments** — Stripe Checkout for event and membership fees, webhook processing, manual resolution/adjustment/waivers, and Excel exports.
- **Methodology library** — upload files or link external methodology and rules documents; public files are served directly, private files via presigned URLs.
- **Administration** — role-aware dashboard (`/manage`) for users, clubs, events, content, payments, and managed clubs, with quick access to the external Tabbycat tournament system.
- **Authentication** — email/password with verification and password reset, plus Google and GitHub OAuth, built on Better-Auth with custom roles.
- **API** — type-safe Nitro endpoints with OpenAPI metadata and interactive documentation.

## Getting Started

### Prerequisites

- Node.js 26 (pinned in `.node-version`, managed by Vite+)
- The Vite+ CLI:

  ```sh
  # macOS / Linux
  curl -fsSL https://vite.plus | bash

  # Windows (PowerShell)
  irm https://vite.plus/ps1 | iex
  ```

- Optional: Docker, if you want to run the full stack with PostgreSQL and S3-compatible storage

### Development

```sh
cd web
vp install
vp run dev
```

The dev server runs at [http://localhost:3000](http://localhost:3000).

No external services are required for local development:

- The database is an embedded **PGlite** instance stored in `.data/database`; migrations run automatically on startup.
- File uploads are saved to `.data/uploads`.
- Emails are printed to the server console instead of being sent.
- Sign-up email verification is skipped.

Useful dev-only endpoints:

- `POST /api/users/me/promote` with `{ "role": "developer" }` — promote your own account to a role so you can access the management dashboard.
- `POST /api/sql` with `{ "query": "SELECT ..." }` — run raw SQL against the development database.
- `PUT /api/storage/upload` and `GET /api/storage/files/...` — local file upload/download used in place of S3.

### Environment Variables

Create a `.env` file (gitignored). Only some variables are needed locally:

| Variable                                                                                      | Needed in   | Notes                                                                                                        |
| --------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `BETTER_AUTH_SECRET`                                                                          | Production  | Session signing secret. Generate with `openssl rand -hex 32`.                                                |
| `BETTER_AUTH_URL`                                                                             | Development | Public base URL, e.g. `http://localhost:3000`. Used for auth callbacks, email links, and local storage URLs. |
| `DATABASE_URL`                                                                                | Production  | PostgreSQL connection string. Ignored in development, which uses embedded PGlite.                            |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`                                                   | Optional    | GitHub OAuth provider.                                                                                       |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`                                                   | Optional    | Google OAuth provider.                                                                                       |
| `S3_PUBLIC_ENDPOINT`                                                                          | Production  | Public S3 endpoint used to build presigned upload/download URLs and public file links.                       |
| `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY`                                                   | Production  | S3 credentials.                                                                                              |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_FROM_EMAIL`, `AWS_FROM_NAME` | Production  | AWS SES sender configuration. In development emails are logged to the console.                               |
| `STRIPE_SECRET_KEY`                                                                           | Payments    | Stripe API key.                                                                                              |
| `STRIPE_WEBHOOK_SECRET`                                                                       | Payments    | Stripe webhook signature secret.                                                                             |

### Database Changes

1. Edit the schema files in `server/db/schema/`.
2. Run `vp run db:generate` to create a new migration in `server/db/migrations/`.
3. Run `vp run db:migrate` to apply it (uses `DATABASE_URL`; development applies migrations automatically).

### Scripts

| Command              | Description                                          |
| -------------------- | ---------------------------------------------------- |
| `vp run dev`         | Start the Nuxt development server                    |
| `vp run build`       | Build for production (output in `.output/`)          |
| `vp run preview`     | Preview the production build                         |
| `vp run check`       | Run Vite+ lint/format checks and the Nuxt type check |
| `vp run check:fix`   | Auto-fix linting and formatting, then type-check     |
| `vp run db:generate` | Generate a Drizzle migration from schema changes     |
| `vp run db:migrate`  | Apply pending database migrations                    |

## Project Structure

```text
web/
├── app/                  # Nuxt frontend
│   ├── assets/           # Global CSS and media
│   ├── components/       # Vue components (event/, profile/, modal/, editor/)
│   ├── composables/      # Client composables (use-feed, use-auth-session, ...)
│   ├── layouts/          # Layouts (default, manage, content)
│   ├── middleware/       # Route middleware (auth, anonymous, profile)
│   ├── pages/            # File-based routes
│   ├── utils/            # Client utilities (auth client, payments)
│   └── app.vue           # Root component
├── server/               # Nitro backend
│   ├── api/              # HTTP endpoints ([resource]/index.get.ts, ...)
│   ├── auth/             # Better-Auth config and permissions
│   ├── db/               # Drizzle setup, schema/, migrations/
│   ├── routes/           # Non-API routes (verify, confirmations, payment return)
│   └── utils/            # Server helpers (auth, storage, mail, settings)
├── shared/               # Code shared by app/ and server/
│   ├── types/            # Domain types (event, user, club, payment, ...)
│   └── utils/            # Pure helpers (dates, formatting, translations)
└── nuxt.config.ts
```

Conventions:

- Client code belongs in `app/`, server code in `server/` — never import server code into `app/`.
- Shared types and pure helpers belong in `shared/` (imported as `#shared/*`).
- Database tables are modularized in `server/db/schema/*.ts`, with relations in `relations.ts`.
- Every API route documents itself with `defineRouteMeta` for the OpenAPI spec.
- Server authorization uses `requireUser(event, roles)`; client pages use the `auth` middleware with `allowedRoles` page meta.

## Roles

| Role                             | Scope                                                                 |
| -------------------------------- | --------------------------------------------------------------------- |
| `user`                           | Default member account.                                               |
| `organizer` / `junior_organizer` | Create and manage events.                                             |
| `motion_committee_member`        | Event management.                                                     |
| `chief_adjudicator`              | Event and user management.                                            |
| `admin`                          | Platform administration: users, clubs, events, content, and payments. |
| `developer`                      | Full access, including managing admins and impersonation.             |

## API Documentation

- Interactive Scalar UI: `/api/docs`
- OpenAPI specification: `/_docs/openapi.json`
- API metadata: `/api`

## Deployment

- `../docker-compose.yml` — full local stack: PostgreSQL 18, RustFS object storage, database migration job, and the web app (`http://localhost:3000`, S3 API on `:9000`, console on `:9001`).
- `../docker-compose.prod.yml` — production stack for [Dokploy](https://dokploy.com) using the published image `ghcr.io/branislavjuhaas/dn-debrief-web`.
- `Dockerfile` — multi-stage build: Vite+ build stage, minimal Node runtime serving `.output/`, and a separate `db-migrate` job for migrations.
- GitHub Actions — checks on `web/**` changes (`check.yml`), a production build check on pull requests (`build-check.yml`), and release builds that push to GHCR and trigger Dokploy (`deploy.yml`).

## Contributing

See the repository-level [CONTRIBUTING.md](../CONTRIBUTING.md), [AI_POLICY.md](../AI_POLICY.md), and [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md). Run `vp run check:fix` before submitting changes. Licensed under the [GNU AGPL v3](../LICENSE).
