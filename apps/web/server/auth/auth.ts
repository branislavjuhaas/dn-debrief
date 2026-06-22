import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, admin as adminPlugin } from "better-auth/plugins";
import * as schema from "@dn-debrief/db/schema";
import { db } from "@dn-debrief/db";
import {
  ac,
  admin,
  chief_adjudicator,
  developer,
  junior_organizer,
  motion_committee_member,
  organizer,
  user,
} from "#server/auth/permissions";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { legalGuardians } from "@dn-debrief/db/schema";
import { adminRoleRank } from "#shared/utils/user";
import type { UserRole } from "#shared/types/user";

export const auth = betterAuth({
  // TODO: use drizzle adapter joins once it support relations v2
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: schema,
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  plugins: [
    openAPI({
      path: "/docs",
    }),
    adminPlugin({
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
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          name: profile.given_name,
          surname: profile.family_name,
        };
      },
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => {
        return {
          name: profile.name.split(" ").slice(0, -1).join(" "),
          surname: profile.name.split(" ").slice(-1)[0],
        };
      },
    },
  },
  user: {
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
      birthDate: {
        type: "date",
        required: false,
        input: true,
      },
      street: {
        type: "string",
        required: false,
        input: true,
      },
      postalCode: {
        type: "string",
        required: false,
        input: true,
      },
      town: {
        type: "string",
        required: false,
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      claims: {
        type: "json",
        required: false,
        input: false, // don't allow user to set claims
      },
    },
  },
  advanced: {
    database: {
      generateId: false,
      useNumberIds: true,
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, token }, _request) => {
      sendEmail(
        [user.email],
        "Overenie účtu",
        `Potvrďte, že ste to vy!\n\nPre potvrdenie autenticity vášho účtu kliknite, prosím, na nasledujúci odkaz: ${process.env.BETTER_AUTH_URL}/verify?token=${token}`,
        generateActionMail(
          "Potvrďte, že ste to vy!",
          "Pre potvrdenie autenticity vášho účtu kliknite, prosím, na nasledujúci odkaz",
          `${process.env.BETTER_AUTH_URL}/verify?token=${token}`,
          "Potvrdiť emailovú identitu",
        ),
      );
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/admin/set-role") {
        const { userId, role } = ctx.body as { userId: number; role: UserRole };
        const userRole = ctx.context.session?.user.role as UserRole;

        if (adminRoleRank(userRole) < adminRoleRank(role)) {
          throw new APIError("UNAUTHORIZED", {
            statusCode: 401,

            message: "Role above current role cannot be set",
          });
        }

        const { role: affectedRole } = (await db.query.users.findFirst({
          where: { id: userId },
          columns: { role: true },
        })) ?? { role: "user" };

        if (adminRoleRank(role) < adminRoleRank(affectedRole)) {
          throw new APIError("UNAUTHORIZED", {
            message: "Role of superior user cannot be set",
          });
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const body = ctx.body as any;
        if (body && "legalGuardian" in body) {
          await db.insert(legalGuardians).values({
            userId: (ctx.context.returned as any).user.id,
            ...body.legalGuardian,
          });
        }
      }
      if (ctx.path === "/update-user") {
        const body = ctx.body as any;
        if (body && "legalGuardian" in body) {
          const userId = (ctx.context.session as any).user.id;

          await db
            .insert(legalGuardians)
            .values({
              userId: userId,
              ...body.legalGuardian,
            })
            .onConflictDoUpdate({
              target: [legalGuardians.userId],
              set: { ...body.legalGuardian },
            });
        }
      }
    }),
  },
});
