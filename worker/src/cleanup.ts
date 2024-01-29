import { type DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, lt } from 'drizzle-orm';
import * as models from './models';
import { deleteObject, type S3Configuration } from './s3';

export default async function cleanup(
  db: DrizzleD1Database<typeof models>,
  s3Config: S3Configuration,
): Promise<string[]> {
  const deleted: string[] = [];
  const toCleanUp = await db.query.shortLinks.findMany({
    where: lt(models.shortLinks.expiresAt, new Date()),
  });

  await Promise.all(toCleanUp.map(async (shortLink) => {
    switch (shortLink.type) {
      case 'url':
        await db.delete(models.shortLinkUrls).where(eq(models.shortLinkUrls.id, shortLink.id));
        await db.delete(models.shortLinks).where(eq(models.shortLinks.id, shortLink.id));
        break;
      case 'paste':
        await db.delete(models.shortLinkPastes).where(eq(models.shortLinkPastes.id, shortLink.id));
        await db.delete(models.shortLinks).where(eq(models.shortLinks.id, shortLink.id));
        break;
      case 'upload':
        await db.delete(models.shortLinkUploads)
          .where(eq(models.shortLinkUploads.id, shortLink.id));
        await db.delete(models.shortLinks).where(eq(models.shortLinks.id, shortLink.id));
        await deleteObject(s3Config, shortLink.id);
        break;
      default:
        throw new Error(`Unexpected short link type ${shortLink.type}`);
    }
    deleted.push(shortLink.id);
  }));

  return deleted;
}
