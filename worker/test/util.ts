import { env } from "cloudflare:test";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import * as models from "../src/models";

export async function doesExist(id: string) {
  const d = drizzle(env.DB);

  const res = await d.select().from(models.shortLinks).where(eq(models.shortLinks.id, id)).limit(1);
  return res.length !== 0;
}
