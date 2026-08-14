import { createAuthClient } from "better-auth/client";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "#server/auth/auth";
import {
  ac,
  admin,
  chief_adjudicator,
  developer,
  junior_organizer,
  motion_committee_member,
  organizer,
  user,
} from "~~/server/auth/permissions";

/**
 * Create and return an authentication client pre-configured for the app.
 *
 * This factory wires up:
 * - `adminClient` plugin with the application's access control (`ac`) and role set.
 * - Additional user profile fields that are stored with the auth user object.
 *
 * Additional fields:
 * - `surname` — required string, user-provided.
 * - `credential` — numeric, required, default 0, not editable by the user.
 * - `birthDate` — optional date, user-provided.
 * - `street`, `postalCode`, `town`, `phone` — optional strings, user-provided.
 * - `phone` — optional string, user-provided.
 * - `claims` — optional JSON, not editable by the user, can be used to store arbitrary claims.
 *
 * @returns Configured auth client instance.
 */
export default () =>
  createAuthClient({
    plugins: [
      inferAdditionalFields<typeof auth>(),
      adminClient({
        ac,
        roles: {
          user,
          organizer,
          junior_organizer,
          chief_adjudicator,
          motion_committee_member,
          admin,
          developer,
        },
      }),
    ],
  });
