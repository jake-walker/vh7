import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const shortLinks = sqliteTable("short_link", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  type: text('type', { enum: ["url", "paste", "upload", "event"] }).notNull(),
  deleteToken: text("delete_token", { length: 128 }),
});

export const shortLinkUrls = sqliteTable("short_link_url", {
  id: text("short_link_id")
    .primaryKey()
    .references(() => shortLinks.id, { onDelete: "cascade", onUpdate: "cascade" }),
  url: text("url").notNull(),
});

export const shortLinkPastes = sqliteTable("short_link_paste", {
  id: text("short_link_id")
    .primaryKey()
    .references(() => shortLinks.id, { onDelete: "cascade", onUpdate: "cascade" }),
  code: text("code").notNull(),
  language: text("language"),
});

export const shortLinkUploads = sqliteTable("short_link_upload", {
  id: text("short_link_id")
    .primaryKey()
    .references(() => shortLinks.id, { onDelete: "cascade", onUpdate: "cascade" }),
  filename: text("filename").notNull(),
  size: integer("size").notNull(),
  hash: text("hash").notNull(),
});

export const shortLinkEvents = sqliteTable('short_link_event', {
  id: text('short_link_id').primaryKey().references(() => shortLinks.id, { onDelete: "cascade", onUpdate: "cascade" }),
  title: text('title').notNull(),
  description: text('description'),
  location: text('location'),
  startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
  endDate: integer('end_date', { mode: 'timestamp' }),
  allDay: integer('all_day', { mode: "boolean" }).notNull().default(false)
});

export type ShortLink = typeof shortLinks.$inferSelect;
export type NewShortLink = typeof shortLinks.$inferInsert;
export type ShortLinkUrl = typeof shortLinkUrls.$inferSelect;
export type NewShortLinkUrl = typeof shortLinkUrls.$inferInsert;
export type ShortLinkPaste = typeof shortLinkPastes.$inferSelect;
export type NewShortLinkPaste = typeof shortLinkPastes.$inferInsert;
export type ShortLinkUpload = typeof shortLinkUploads.$inferSelect;
export type NewShortLinkUpload = typeof shortLinkUploads.$inferInsert;
export type ShortLinkEvent = typeof shortLinkEvents.$inferSelect;
export type NewShortLinkEvent = typeof shortLinkEvents.$inferInsert;
export type ShortLinkAny = ShortLinkUrl | ShortLinkPaste | ShortLinkUpload | ShortLinkEvent;
export type JoinedShortLinkAny = ShortLink &
  ((ShortLinkUrl & { type: "url" }) | (ShortLinkPaste & { type: "paste" }) | (ShortLinkUpload & { type: "upload" }) | (ShortLinkEvent & { type: "event" }));
