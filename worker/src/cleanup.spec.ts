import { drizzle } from "drizzle-orm/d1";
import cleanup from "./cleanup";
import { createShortUrl } from "./controller";
import { appEnv, doesExist } from "./index.spec";
import * as models from "./models";

test("cleanup", async () => {
  const { DB, UPLOADS } = appEnv;
  const d = drizzle(DB, { schema: models });

  const validDate = new Date();
  validDate.setMonth(validDate.getMonth() + 1);

  const expiredShortLink = await createShortUrl(d, "https://example.com", new Date(2000, 1, 1).getTime(), undefined);
  const validShortLink = await createShortUrl(d, "https://example.com", validDate.getTime(), undefined);
  const noExpiryShortLink = await createShortUrl(d, "https://example.com", null, undefined);

  const deleted = await cleanup(d, UPLOADS);

  expect(deleted).toContain(expiredShortLink.id);
  expect(deleted).not.toContain(validShortLink.id);
  expect(deleted).not.toContain(noExpiryShortLink.id);

  expect(await doesExist(expiredShortLink.id)).toBe(false);
  expect(await doesExist(validShortLink.id)).toBe(true);
  expect(await doesExist(noExpiryShortLink.id)).toBe(true);
});
