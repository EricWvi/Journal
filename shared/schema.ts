import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const entries = pgTable("entry", {
  id: serial("id").primaryKey(),
  creatorId: integer("creator_id").default(1).notNull(),
  content: text("content").default(" ").notNull(),
  // photos: text("photos").array(),
  // mood: text("mood"),
  // location: text("location"),
  // weather: text("weather"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at").default(null),
});

export const insertEntrySchema = createInsertSchema(entries).omit({
  id: true,
  creatorId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export type InsertEntry = z.infer<typeof insertEntrySchema>;
export type Entry = typeof entries.$inferSelect;
