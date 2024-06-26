import { type DrizzleD1Database } from 'drizzle-orm/d1';
import { lt } from 'drizzle-orm';
import * as models from './models';
import { deleteItem } from './controller';

export default async function cleanup(
  db: DrizzleD1Database<typeof models>,
  bucket: R2Bucket,
): Promise<string[]> {
  const deleted: string[] = [];
  const toCleanUp = await db.query.shortLinks.findMany({
    where: lt(models.shortLinks.expiresAt, new Date()),
  });

  await Promise.all(toCleanUp.map(async (shortLink) => {
    await deleteItem(db, bucket, shortLink);
    deleted.push(shortLink.id);
  }));

  return deleted;
}
