import { eq } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { customAlphabet } from "nanoid";
import * as models from "./models";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 4);

export async function sha256(file: File) {
  const fileData = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", fileData);
  const array = Array.from(new Uint8Array(digest));
  return array.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createShortUrl(
  db: DrizzleD1Database<typeof models>,
  url: string,
  expires: number | null,
  deleteToken: string | undefined,
): Promise<models.ShortLink & models.ShortLinkUrl> {
  const id = nanoid();

  const stub: models.ShortLink = {
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: expires ? new Date(expires) : null,
    type: "url",
    deleteToken: deleteToken || null,
  };

  const shortLinkUrl: models.ShortLinkUrl = {
    id,
    url,
  };

  await db.insert(models.shortLinks).values(stub).run();
  await db.insert(models.shortLinkUrls).values(shortLinkUrl).run();

  return { ...stub, ...shortLinkUrl };
}

export async function createPaste(
  db: DrizzleD1Database<typeof models>,
  code: string,
  language: string | null,
  expires: number | null,
  deleteToken: string | undefined,
): Promise<models.ShortLink & models.ShortLinkPaste> {
  const id = nanoid();

  const stub: models.ShortLink = {
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: expires ? new Date(expires) : null,
    type: "paste",
    deleteToken: deleteToken || null,
  };

  const paste: models.ShortLinkPaste = {
    id,
    code,
    language,
  };

  await db.insert(models.shortLinks).values(stub).run();
  await db.insert(models.shortLinkPastes).values(paste).run();

  return { ...stub, ...paste };
}

export async function createUpload(
  db: DrizzleD1Database<typeof models>,
  bucket: R2Bucket,
  file: File,
  rawExpires: Date | null,
  deleteToken: string | undefined,
): Promise<models.ShortLink & models.ShortLinkUpload> {
  const id = nanoid();
  const hash = await sha256(file);

  await bucket.put(id, file);

  const maxExpiry = new Date();
  maxExpiry.setDate(maxExpiry.getDate() + 30);
  let expires = rawExpires;
  if (expires !== null && expires > maxExpiry) {
    expires = maxExpiry;
  }

  const stub: models.ShortLink = {
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: expires ? new Date(expires) : null,
    type: "upload",
    deleteToken: deleteToken || null,
  };

  const upload: models.ShortLinkUpload = {
    id,
    filename: file.name,
    size: file.size,
    hash,
  };

  await db.insert(models.shortLinks).values(stub).run();
  await db.insert(models.shortLinkUploads).values(upload).run();

  return { ...stub, ...upload };
}

export async function createEvent(
  db: DrizzleD1Database<typeof models>,
  expires: number | null,
  deleteToken: string | undefined,
  data: Omit<models.NewShortLinkEvent, "id">
): Promise<models.ShortLink & models.ShortLinkEvent> {
  const id = nanoid();

  const stub: models.ShortLink = {
    id,
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: expires ? new Date(expires) : null,
    type: "event",
    deleteToken: deleteToken || null,
  };

  const event: models.NewShortLinkEvent = {
    id,
    ...data
  };

  await db.insert(models.shortLinks).values(stub).run();
  await db.insert(models.shortLinkEvents).values(event).run();

  return { ...stub, ...event, description: event.description ?? null, location: event.location ?? null, endDate: event.endDate ?? null, allDay: event.allDay ?? false };
}

export async function lookup(
  db: DrizzleD1Database<typeof models>,
  id: string,
): Promise<null | models.JoinedShortLinkAny> {
  if (!/[a-zA-Z0-9]{4}/.test(id)) {
    return null;
  }

  const stub = await db.query.shortLinks.findFirst({
    where: eq(models.shortLinks.id, id),
  });

  if (!stub) {
    return null;
  }

  let data: models.ShortLinkAny | undefined;

  switch (stub.type) {
    case "url":
      data = await db.query.shortLinkUrls.findFirst({
        where: eq(models.shortLinkUrls.id, id),
      });
      if (data === undefined) return null;
      return { ...stub, type: "url", ...data };
    case "paste":
      data = await db.query.shortLinkPastes.findFirst({
        where: eq(models.shortLinkPastes.id, id),
      });
      if (data === undefined) return null;
      return { ...stub, type: "paste", ...data };
    case "upload":
      data = await db.query.shortLinkUploads.findFirst({
        where: eq(models.shortLinkUploads.id, id),
      });
      if (data === undefined) return null;
      return { ...stub, type: "upload", ...data };
    case "event":
      data = await db.query.shortLinkEvents.findFirst({
        where: eq(models.shortLinkEvents.id, id)
      });
      if (data === undefined) return null;
      return { ...stub, type: "event", ...data };
    default:
      throw new Error(`Unexpected type ${stub.type}`);
  }
}

export async function deleteItem(
  db: DrizzleD1Database<typeof models>,
  bucket: R2Bucket,
  shortLink: { id: string; type: string },
): Promise<void> {
  switch (shortLink.type) {
    case "url":
      await db.delete(models.shortLinkUrls).where(eq(models.shortLinkUrls.id, shortLink.id));
      await db.delete(models.shortLinks).where(eq(models.shortLinks.id, shortLink.id));
      break;
    case "paste":
      await db.delete(models.shortLinkPastes).where(eq(models.shortLinkPastes.id, shortLink.id));
      await db.delete(models.shortLinks).where(eq(models.shortLinks.id, shortLink.id));
      break;
    case "upload":
      await db.delete(models.shortLinkUploads).where(eq(models.shortLinkUploads.id, shortLink.id));
      await db.delete(models.shortLinks).where(eq(models.shortLinks.id, shortLink.id));
      await bucket.delete(shortLink.id);
      break;
    case "event":
      await db.delete(models.shortLinkEvents).where(eq(models.shortLinkEvents.id, shortLink.id));
      await db.delete(models.shortLinks).where(eq(models.shortLinks.id, shortLink.id));
      break;
    default:
      throw new Error(`Unexpected short link type: ${shortLink.type}`);
  }
}
