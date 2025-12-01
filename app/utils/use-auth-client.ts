import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
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
 * - `birthdate` — optional date, user-provided.
 * - `address` — optional string, user-provided.
 *
 * @returns Configured auth client instance.
 */
export default () =>
  createAuthClient({
    plugins: [
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
    additionalFields: {
      surname: {
        type: "string",
        required: true,
        input: true,
      },
      credential: {
        type: "number",
        required: true,
        defaultValue: 0,
        input: false, // don't allow user to set credential
      },
      birthdate: {
        type: "date",
        required: false,
        input: true,
      },
      address: {
        type: "string",
        required: false,
        input: true,
      },
    },
  });
