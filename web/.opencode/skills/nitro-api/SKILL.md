---
name: Nitro API
description: Guidelines and patterns for creating Nitro server API routes, request validation with Zod, error handling, and OpenAPI documentation in dn-debrief
---

# Nitro API Routes in DN Debrief

This project uses Nuxt Nitro for server-side API endpoints, paired with Zod validation and OpenAPI auto-documentation.

## Key Files & Layout

- `server/api/`: API endpoint routes following file-based routing:
  - Format: `[feature]/[subpath].[method].ts` (e.g. `events/index.get.ts`, `events/[slug]/index.patch.ts`).
- OpenAPI docs:
  - Endpoints define OpenAPI metadata via `defineRouteMeta({ openAPI: { ... } })`.
  - Served at `/_docs/openapi.json` and interactive Scalar UI at `/api/docs`.

## Standard Route Blueprint

```ts
import * as z from "zod";
import { requireUser } from "#server/utils/auth";

defineRouteMeta({
  openAPI: {
    tags: ["Events"],
    summary: "Create a new event",
    description: "Creates an event and initializes default settings.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
        },
      },
    },
    responses: {
      200: { description: "Event created successfully" },
      401: { description: "Unauthorized" },
      403: { description: "Forbidden" },
    },
  },
});

const bodySchema = z.object({
  name: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  // 1. Auth check
  const user = await requireUser(event, ["admin", "developer"]);

  // 2. Input validation
  const body = await readValidatedBody(event, bodySchema.parse);

  // 3. Logic & DB execution
  // ...

  return { success: true };
});
```

## Conventions

1. **Validation**:
   - Use `readValidatedBody(event, schema.parse)` for request payloads.
   - Use `getValidatedQuery(event, schema.parse)` for query strings.
   - Use `getRouterParam(event, "param")` for dynamic path parameters.

2. **Errors**:
   - Use Nuxt's `createError({ statusCode, statusMessage, message })` and throw it.
   - Standard status codes: 400 for bad input, 401 for unauthenticated, 403 for unauthorized role, 404 for not found.

3. **OpenAPI**:
   - Always group endpoints with meaningful `tags` (e.g., `["Events"]`, `["Clubs"]`, `["Users"]`, `["Payments"]`, `["Settings"]`).
