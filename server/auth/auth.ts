import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, admin as adminPlugin } from "better-auth/plugins";
import { db } from 'hub:db'
import * as schema from "~~/server/db/schema/auth";
import { sendEmail, generateEmailTemplate } from "~~/server/utils/send-email";
import { supervisors } from "~~/server/db/schema/auth";
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

export const auth = betterAuth({
  experimental: { joins: true },
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema: schema,
  }),
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
      phone: {
        type: "string",
        required: false,
        input: true,
      }
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          const userId = user.id;
          const body = ctx?.body;

          const supervisor = body?.supervisor;

          if (supervisor) {
            try {
              await db.insert(supervisors).values({
                ...supervisor,
                userId,
              });
            } catch (error) {
              console.error(error);
            }
          }
        },
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
      await sendEmail({
        to: [user.email],
        subject: "Potvrďte svoju emailovú adresu",
        html: generateEmailTemplate({
          title: "Potvrďte, že ste to vy!",
          text: "Pre potvrdenie autenticity vášho účtu kliknite, prosím, na nasledujúci odkaz:",
          icon: "https://www.sda.sk/wp-content/uploads/2025/11/question_mark.png",
          linkText: "Potvrdiť emailovú adresu",
          link: `${process.env.BETTER_AUTH_URL}/auth/verify?token=${token}`,
        }),
      });
    },
  },
});
