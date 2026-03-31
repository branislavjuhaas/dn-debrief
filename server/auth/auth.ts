import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, admin as adminPlugin } from "better-auth/plugins";
import * as schema from "#server/db/schema/auth";
import { db } from "#server/db/db";
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
      birthdate: {
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
      city: {
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
      console.log(
        `Send verification email to ${user.email} with token ${token}`,
      );
    },
  },
});
