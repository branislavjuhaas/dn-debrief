import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  userAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

// Admin role (all admin permissions except impersonation)
export const admin = ac.newRole({
  user: ["create", "list", "set-role", "ban", "delete", "set-password"],
  session: ["list", "revoke", "delete"],
});

// Developer role (all admin permissions including impersonation)
export const developer = ac.newRole({
  ...adminAc.statements,
  user: ["impersonate-admins", ...adminAc.statements.user],
});

// All other roles get user permissions
export const user = ac.newRole({
  ...userAc.statements,
});

export const organizer = ac.newRole({
  ...userAc.statements,
});

export const junior_organizer = ac.newRole({
  ...userAc.statements,
});

export const chief_adjudicator = ac.newRole({
  ...userAc.statements,
});

export const motion_committee_member = ac.newRole({
  ...userAc.statements,
});
