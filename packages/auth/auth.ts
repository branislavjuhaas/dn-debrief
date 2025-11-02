import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@repo/db";

/**
 * Generate a normalized search string from a user's name.
 *
 * - Converts to lowercase.
 * - Removes diacritics/accents.
 * - Removes any non-alphanumeric characters.
 * - Returns an empty string for `undefined`.
 *
 * @param name - The name to normalize.
 * @returns A search-friendly string.
 */
const generateSearchParam = (name: string | undefined): string =>
  name
    ? name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9]/g, "") // Remove non-alphanumeric
    : "";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
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
});
