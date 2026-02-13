import { lt } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { deleteItem } from "./controller";
import * as models from "./models";

export default async function cleanup(db: DrizzleD1Database<typeof models>, bucket: R2Bucket): Promise<string[]> {
  const deleted: string[] = [];
  const toCleanUp = await db.query.shortLinks.findMany({
    where: lt(models.shortLinks.expiresAt, new Date()),
  });

  console.log(`Cleanup is removing ${toCleanUp.length} items...`);

  await Promise.all(
    toCleanUp.map(async (shortLink) => {
      console.log(`Removing ${shortLink.id}...`);
      await deleteItem(db, bucket, shortLink);
      deleted.push(shortLink.id);
    }),
  );

  return deleted;
}
