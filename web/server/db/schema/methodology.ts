import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  serial,
} from "drizzle-orm/pg-core";

export const methodologyFiles = pgTable(
  "methodology_files",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    isExternal: boolean("external").default(false).notNull(),
    filePath: text("file_path"),
    authorId: integer("author_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("users_author_id_idx").on(table.authorId)],
);
