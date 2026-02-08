import { sql } from "drizzle-orm";
import {
  int,
  sqliteTable,
  text,
  uniqueIndex,
  blob,
} from "drizzle-orm/sqlite-core";

// create users table
export const usersTable = sqliteTable(
  "users_table",
  {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    age: int().notNull(),
    email: text().notNull().unique(),
    createdAt: text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  // create unique index on email column
  (table) => [uniqueIndex("email_idx").on(table.email)],
);

// export types for users table
export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

////////////////////////////////////////////////////////////
// create images table
////////////////////////////////////////////////////////////
export const imagesTable = sqliteTable(
  "images_table",
  {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    type: text().notNull(),
    size: int().notNull(),
    image: blob().notNull(),
    createdAt: text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text()
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("name_idx").on(table.name)],
);

// export types for images table
export type Image = typeof imagesTable.$inferSelect;
export type InsertImage = typeof imagesTable.$inferInsert;
