import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { users } from "./auth";

export const methodologyFiles = pgTable(
  "methodology_files",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    isExternal: boolean("external").default(false).notNull(),
    fileUrl: text("file_url").notNull(),
    authorId: integer("author_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("users_author_id_idx").on(table.authorId)],
);
