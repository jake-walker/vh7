import { env } from "cloudflare:test";
import { drizzle } from "drizzle-orm/d1";
import { expect, test } from "vitest";
import cleanup from "../src/cleanup";
import { createShortUrl } from "../src/controller";
import * as models from "../src/models";
import { doesExist } from "./util";

test("cleanup", async () => {
  const d = drizzle(env.DB, { schema: models });

  const validDate = new Date();
  validDate.setMonth(validDate.getMonth() + 1);

  const expiredShortLink = await createShortUrl(d, "https://example.com", new Date(2000, 1, 1), undefined);
  const validShortLink = await createShortUrl(d, "https://example.com", validDate, undefined);
  const noExpiryShortLink = await createShortUrl(d, "https://example.com", null, undefined);

  const deleted = await cleanup(d, env.UPLOADS);

  expect(deleted).toContain(expiredShortLink.id);
  expect(deleted).not.toContain(validShortLink.id);
  expect(deleted).not.toContain(noExpiryShortLink.id);

  expect(await doesExist(expiredShortLink.id)).toBe(false);
  expect(await doesExist(validShortLink.id)).toBe(true);
  expect(await doesExist(noExpiryShortLink.id)).toBe(true);
});
