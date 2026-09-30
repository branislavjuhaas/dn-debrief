---
name: Drizzle DB (v1 RC)
description: Guidelines and strict syntax for Drizzle ORM v1 RC (1.0.0-rc.4) schema definitions, defineRelations, and migrations in dn-debrief
---

# Drizzle ORM (v1 RC) in DN Debrief

This project uses **Drizzle ORM v1 RC** (`drizzle-orm@1.0.0-rc.4` and `drizzle-kit@1.0.0-rc.4`).
**CRITICAL**: Do NOT use legacy Drizzle v0 syntax (`relations(table, ({ one, many }) => ...)`). Drizzle v1 uses the new `defineRelations` API.

## Directory Structure

- `server/db/index.ts`: Database client initialization. Uses `@electric-sql/pglite` in local dev/test with automated migration, and `postgres` (Postgres.js) in production.
- `server/db/schema/`: Schema table modules:
  - `auth.ts`: Users, sessions, accounts, verifications (Better-Auth tables)
  - `events.ts`: Events, event registrations, schedules, question configs
  - `clubs.ts`: Clubs, memberships, club managers
  - `payments.ts`: Payments, Stripe checkouts, resolutions
  - `settings.ts`: Key-value application settings
  - `methodology.ts`: Methodology files and resources
  - `relations.ts`: Centralized relation definitions using `defineRelations`
- `server/db/migrations/`: Generated migration snapshots and SQL files.

## Drizzle v1 Relations Syntax (`server/db/schema/relations.ts`)

In Drizzle v1 RC, **all relations are defined in a single call to `defineRelations`**:

```ts
import { defineRelations } from "drizzle-orm";
import { users, accounts } from "./auth";
import { clubs, clubMemberships } from "./clubs";

export const relations = defineRelations(
  {
    users,
    accounts,
    clubs,
    clubMemberships,
  },
  (r) => ({
    users: {
      // 1-to-many:
      accounts: r.many.accounts({
        from: r.users.id,
        to: r.accounts.userId,
      }),
      // Many-to-many through junction table:
      clubs: r.many.clubs({
        from: r.users.id.through(r.clubMemberships.userId),
        to: r.clubs.id.through(r.clubMemberships.clubId),
        alias: "member",
      }),
    },
    accounts: {
      // 1-to-1 / belongs-to:
      user: r.one.users({
        from: r.accounts.userId,
        to: r.users.id,
      }),
    },
  }),
);
```

### Prohibited Legacy Syntax

- **NEVER** use `relations(table, ({ one, many }) => ...)` (v0 syntax).
- **NEVER** use `fields: [...]` or `references: [...]` inside relation configs.
- **NEVER** import or call `one(...)` or `many(...)` helper functions directly.

## Primary Keys & Columns

- UUID primary keys use UUIDv7: `uuid("id").primaryKey().default(sql`uuidv7()`)`.
- Integer serial IDs use `serial("id").primaryKey()`.
- Enums are created with `pgEnum("enum_name", [...])`.

## Migrations & Database Commands

```sh
pnpm db:generate   # Generates SQL migration & snapshot from server/db/schema/*
pnpm db:migrate    # Applies pending migrations to the database
```

- When altering or creating tables, add or update the schema in `server/db/schema/*.ts`.
- If new relations are added, update `relations` in `server/db/schema/relations.ts`.
- Run `pnpm db:generate` to produce the migration file.
- Never edit existing, previously applied migration files.
