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
