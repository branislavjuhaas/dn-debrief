import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI } from "better-auth/plugins";
import { db } from "~~/server/db/db";
import * as schema from "~~/server/db/schema/auth";
import { sendEmail, generateEmailTemplate } from "~~/server/utils/send-email";

/**
 * Generate a normalized search string from a user's name.
 *
 * - Converts to lowercase.
 * - Removes diacritics/accents.
 * - Removes any non-alphanumeric characters.
 * - Returns an empty string for `undefined`.
 * - Truncates to a maximum of 36 characters.
 *
 * @param name - The name to normalize.
 * @returns A search-friendly string (max 36 chars).
 */
const generateSearchParam = (name: string | undefined): string =>
  name
    ? name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]/g, "") // Remove non-alphanumeric
        .slice(0, 36)
    : "";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
    usePlural: true,
    schema: schema,
  }),
  plugins: [
    openAPI({
      path: "/api/docs/auth",
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
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      search: {
        type: "string",
        required: true,
        defaultValue: "",
        input: false, // don't allow user to set search
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "user",
        input: false, // don't allow user to set role
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
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, _ctx) => {
          return {
            data: {
              ...user,
              search: generateSearchParam(user.name),
            },
          };
        },
      },
      update: {
        before: async (data, _ctx) => {
          return {
            data: {
              ...data,
              search: generateSearchParam(data.name),
            },
          };
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
    sendVerificationEmail: async ({ user, token }, request) => {
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
