import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, admin as adminPlugin } from "better-auth/plugins";
import * as schema from "#server/db/schema/auth";
import { db } from "#server/db";
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
import { legalGuardians, users } from "#server/db/schema/auth";
import { resendPendingGuardianConfirmations } from "#server/lib/guardian";
import { adminRoleRank } from "#shared/utils/user";
import type { UserRole } from "#shared/types/user";
import { eq } from "drizzle-orm";

export const auth = betterAuth({
  // TODO: use drizzle adapter joins once it support relations v2
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: schema,
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 30,
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
    sendResetPassword: async ({ user, url, token }, _request) => {
      void sendEmail(
        [user.email],
        "Obnovenie hesla",
        `Kliknite na nasledujúci odkaz pre obnovenie hesla: ${url}`,
        generateActionMail(
          "Obnovte si heslo na platforme DebRIEF a získajte prístup k svojmu účtu.",
          "Obnovte si heslo na platforme DebRIEF",
          "Kliknite na nasledujúci odkaz pre obnovenie hesla",
          `${process.env.BETTER_AUTH_URL}/auth/reset-password?token=${token}`,
          "Obnoviť heslo",
        ),
      );
    },
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
        type: "string",
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
    // Send verification email on sign up in production, skip in dev/test mode
    sendOnSignUp: !(import.meta.dev || import.meta.test),
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, token }, _request) => {
      void sendEmail(
        [user.email],
        "Overenie účtu",
        `Potvrďte, že ste to vy!\n\nPre potvrdenie autenticity vášho účtu kliknite, prosím, na nasledujúci odkaz: ${process.env.BETTER_AUTH_URL}/verify?token=${token}`,
        generateActionMail(
          "Pre aktiváciu vášho účtu, potvrďte, prosím, svoj email",
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

        const session = await auth.api.getSession({
          headers: ctx.headers!,
        });

        const userRole = session?.user.role as UserRole;

        if (!userRole || adminRoleRank(userRole) < adminRoleRank(role)) {
          throw new APIError("FORBIDDEN", {
            statusCode: 403,
            message: "Role above setter user's role cannot be set",
          });
        }

        const { role: affectedRole } = (await db.query.users.findFirst({
          where: { id: userId },
          columns: { role: true },
        })) ?? { role: "user" };

        if (adminRoleRank(userRole) < adminRoleRank(affectedRole)) {
          throw new APIError("FORBIDDEN", {
            statusCode: 403,
            message: "Role of superior user cannot be set",
          });
        }
      }

      // Legal guardian details may only be set for minors, and the guardian's
      // e-mail must never be the same address as the account's own e-mail.
      if (ctx.path === "/sign-up/email" || ctx.path === "/update-user") {
        const body = ctx.body as
          | {
              email?: string;
              birthDate?: string;
              legalGuardian?: { name?: string; email?: string };
            }
          | undefined;

        if (body?.legalGuardian) {
          const name = body.legalGuardian.name?.trim() ?? "";
          const email = body.legalGuardian.email?.trim().toLowerCase() ?? "";

          if (!name) {
            throw new APIError("BAD_REQUEST", {
              statusCode: 400,
              message: "Legal guardian's name is required",
            });
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new APIError("BAD_REQUEST", {
              statusCode: 400,
              message: "Legal guardian's e-mail address is not valid",
            });
          }

          const session =
            ctx.path === "/update-user"
              ? await auth.api.getSession({
                  headers: ctx.headers!,
                })
              : null;

          const accountEmail = (
            ctx.path === "/sign-up/email" ? body.email : session?.user.email
          )
            ?.trim()
            .toLowerCase();

          if (accountEmail && email === accountEmail) {
            throw new APIError("BAD_REQUEST", {
              statusCode: 400,
              message:
                "Legal guardian's e-mail address must differ from the account e-mail",
            });
          }

          const birthDate = body.birthDate ?? session?.user.birthDate;
          const birth = birthDate ? new Date(birthDate) : null;
          const age = birth
            ? new Date().getFullYear() -
              birth.getFullYear() -
              (new Date().getMonth() < birth.getMonth() ||
              (new Date().getMonth() === birth.getMonth() &&
                new Date().getDate() < birth.getDate())
                ? 1
                : 0)
            : null;

          if (age !== null && age >= 18) {
            throw new APIError("BAD_REQUEST", {
              statusCode: 400,
              message: "Adult users cannot change their legal guardian",
            });
          }

          body.legalGuardian.name = name;
          body.legalGuardian.email = email;
        }
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const body = ctx.body as any;
        if (body && "legalGuardian" in body) {
          await db.insert(legalGuardians).values({
            userId: (ctx.context.returned as any).user.id,
            createdAt: undefined,
            ...body.legalGuardian,
          });
        }

        // Auto-verify email in dev/test mode
        if (import.meta.dev || import.meta.test) {
          await db
            .update(users)
            .set({ emailVerified: true })
            .where(eq(users.id, (ctx.context.returned as any).user.id));
        }
      }
      if (ctx.path === "/update-user") {
        const body = ctx.body as any;
        if (body && body.legalGuardian) {
          const userId = (ctx.context.session as any).user.id;
          const nextGuardian = {
            name: String(body.legalGuardian.name).trim(),
            email: String(body.legalGuardian.email).trim().toLowerCase(),
          };

          const previousGuardian = await db.query.legalGuardians.findFirst({
            columns: { email: true },
            where: { userId },
          });

          await db
            .insert(legalGuardians)
            .values({
              userId: userId,
              ...nextGuardian,
            })
            .onConflictDoUpdate({
              target: [legalGuardians.userId],
              set: nextGuardian,
            });

          // A corrected guardian address would otherwise leave pending
          // registrations waiting for a confirmation that never arrives.
          if (
            previousGuardian?.email?.trim().toLowerCase() !== nextGuardian.email
          ) {
            await resendPendingGuardianConfirmations(userId, nextGuardian);
          }
        }
      }
    }),
  },
});
