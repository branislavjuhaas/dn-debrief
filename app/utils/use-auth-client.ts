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
  });
