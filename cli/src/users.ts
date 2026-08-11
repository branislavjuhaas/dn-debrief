import { defineCommand } from "citty";
import consola from "consola";
import { initDb } from "./db";
import { fakerSK } from "@faker-js/faker";
import { accounts, users } from "#db/schema/auth";

import { randomBytes, scryptSync } from "node:crypto";

/**
 * Hashes a plain-text password using scrypt with a unique random salt,
 * matching Better Auth's default password hashing pattern.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");

  // Better Auth utilizes scrypt parameters optimized for secure storage
  const derivedKey = scryptSync(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });

  // Returns a combined string format: "salt:hashedPassword"
  return `${salt}:${derivedKey.toString("hex")}`;
}

const createDeveloperCommand = defineCommand({
  meta: {
    name: "create dev",
    description: "Create a developer user",
  },
  async run() {
    const db = initDb();

    const name = await consola.prompt(
      "Enter name and surname of the developer user (e.g. John Doe)",
      {
        type: "text",
      },
    );

    const firstName = name.split(" ")[0];
    const lastName = name.split(" ")[1];

    const email = await consola.prompt("Enter email of the developer user", { type: "text" });
    const password = await consola.prompt("Enter password of the developer user", { type: "text" });
    const configureAll = await consola.prompt("Do you want to configure all properties?", {
      type: "select",
      options: [
        { label: "No", value: "no" },
        { label: "Yes (manually)", value: "manual" },
        { label: "Yes (random)", value: "random" },
      ],
    });

    let imageUrl: string | undefined,
      birthDate: string | undefined,
      street: string | undefined,
      town: string | undefined,
      postalCode: string | undefined,
      phone: string | undefined;

    if (configureAll === "random") {
      imageUrl = fakerSK.image.avatar();
      birthDate = fakerSK.date.birthdate().toISOString();
      street = fakerSK.location.street();
      town = fakerSK.location.city();
      postalCode = fakerSK.location.zipCode("#####");
      phone = fakerSK.phone.number({ style: "international" });
    }

    if (configureAll === "manual") {
      imageUrl = await consola.prompt("Enter image URL of the developer user", { type: "text" });
      birthDate = await consola.prompt("Enter birth date of the developer user", { type: "text" });
      street = await consola.prompt("Enter street of the developer user", { type: "text" });
      town = await consola.prompt("Enter town of the developer user", { type: "text" });
      postalCode = await consola.prompt("Enter postal code of the developer user", {
        type: "text",
      });
      phone = await consola.prompt("Enter phone number of the developer user", { type: "text" });
    }

    await db.transaction(async (tx) => {
      // 1. Insert User
      const [user] = await tx
        .insert(users)
        .values({
          email,
          name: firstName,
          surname: lastName,
          image: imageUrl ?? null,
          birthDate,
          street,
          town,
          postalCode,
          phone,
          emailVerified: true,
          role: "developer",
        })
        .returning();

      // 2. Insert Account (Required by Better Auth for Email/Password)
      const hashedPassword = hashPassword(password);

      consola.info(`Hashed password: ${hashedPassword}`);

      await tx.insert(accounts).values({
        userId: user.id,
        accountId: user.id.toString(), // Usually user ID or email for credential provider
        providerId: "credential", // Identifies email-password authentication
        password: hashedPassword,
      });
      consola.success(`User ${user.email} created successfully`);
    });
    process.exit(0);
  },
});

export const createCommand = defineCommand({
  meta: {
    name: "create",
    description: "Create a new user",
  },
  subCommands: {
    developer: createDeveloperCommand,
  },
});

export const usersCommand = defineCommand({
  meta: {
    name: "users",
    description: "Manage users",
  },
  subCommands: {
    create: createCommand,
  },
});
