import {
  integer, sqliteTable, text,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const shortLinks = sqliteTable('short_link', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  type: text('type').notNull(),
  deleteToken: text('delete_token', { length: 128 }),
});

export const shortLinkUrls = sqliteTable('short_link_url', {
  id: text('short_link_id').primaryKey().references(() => shortLinks.id),
  url: text('url').notNull(),
});

export const shortLinkPastes = sqliteTable('short_link_paste', {
  id: text('short_link_id').primaryKey().references(() => shortLinks.id),
  code: text('code').notNull(),
  language: text('language'),
});

export const shortLinkUploads = sqliteTable('short_link_upload', {
  id: text('short_link_id').primaryKey().references(() => shortLinks.id),
  filename: text('filename').notNull(),
  size: integer('size').notNull(),
  hash: text('hash').notNull(),
});

export type ShortLink = typeof shortLinks.$inferSelect;
export type NewShortLink = typeof shortLinks.$inferInsert;
export type ShortLinkUrl = typeof shortLinkUrls.$inferSelect;
export type NewShortLinkUrl = typeof shortLinkUrls.$inferInsert;
export type ShortLinkPaste = typeof shortLinkPastes.$inferSelect;
export type NewShortLinkPaste = typeof shortLinkPastes.$inferInsert;
export type ShortLinkUpload = typeof shortLinkUploads.$inferSelect;
export type NewShortLinkUpload = typeof shortLinkUploads.$inferInsert;
export type ShortLinkAny = ShortLinkUrl | ShortLinkPaste | ShortLinkUpload;
export type JoinedShortLinkAny = ShortLink & (
  (ShortLinkUrl & { type: 'url' }) |
  (ShortLinkPaste & { type: 'paste' }) |
  (ShortLinkUpload & { type: 'upload' })
);
