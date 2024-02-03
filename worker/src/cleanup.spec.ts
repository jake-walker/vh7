import { drizzle } from 'drizzle-orm/d1';
import * as models from './models';
import cleanup from './cleanup';
import { createShortUrl } from './controller';
import { appEnv } from './index.spec';

test('cleanup', async () => {
  const { DB } = appEnv;
  const d = drizzle(DB, { schema: models });

  const validDate = new Date();
  validDate.setMonth(validDate.getMonth() + 1);

  const expiredShortLink = await createShortUrl(d, 'https://example.com', new Date(2000, 1, 1).getTime());
  const validShortLink = await createShortUrl(d, 'https://example.com', validDate.getTime());
  const noExpiryShortLink = await createShortUrl(d, 'https://example.com', null);

  const deleted = await cleanup(d, {
    accessKeyId: appEnv.S3_ACCESS_KEY_ID,
    secretAccessKey: appEnv.S3_SECRET_ACCESS_KEY,
    bucket: appEnv.S3_BUCKET,
    endpointUrl: appEnv.S3_ENDPOINT_URL,
    region: appEnv.S3_REGION,
  });

  expect(deleted).toContain(expiredShortLink.id);
  expect(deleted).not.toContain(validShortLink.id);
  expect(deleted).not.toContain(noExpiryShortLink.id);
});
