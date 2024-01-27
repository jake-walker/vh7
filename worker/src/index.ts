import { Hono, type MiddlewareHandler } from 'hono';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { cors } from 'hono/cors';
import { PasteArgs, ShortLinkArgs, UploadArgs } from './schema';
import {
  createPaste, createShortUrl, createUpload, lookup,
} from './controller';
import { checkDirectUserAgent, getFrontendUrl, isValidId } from './helpers';
import * as models from './models';
import { S3Configuration, getObject } from './s3';

export type Bindings = {
  DB: D1Database,
  VH7_ENV: string,
  S3_ACCESS_KEY_ID: string,
  S3_SECRET_ACCESS_KEY: string,
  S3_REGION: string,
  S3_ENDPOINT_URL: string,
  S3_BUCKET: string
};

type Env = {
  Bindings: Bindings,
  Variables: {
    db?: DrizzleD1Database<typeof models>
  }
};

const app = new Hono<Env>();

const withDb: MiddlewareHandler = async (c, next) => {
  c.set('db', drizzle(c.env.DB, { schema: models }));
  await next();
};

app.use('*', cors());

app.get('/', (c) => c.text('VH7'));

app.post('/api/shorten',
  withDb,
  async (c) => {
    const parsed = ShortLinkArgs.safeParse(await c.req.parseBody());

    if (!parsed.success) {
      return c.json({
        error: 'Invalid request data',
        status: 400,
        detail: parsed.error.issues,
      }, 400);
    }

    if (c.var.db === undefined) {
      return c.status(500);
    }

    const shortUrl = await createShortUrl(c.var.db, parsed.data.url, parsed.data.expires);
    return c.json(shortUrl);
  });

app.post('/api/paste',
  withDb,
  async (c) => {
    const parsed = PasteArgs.safeParse(await c.req.parseBody());

    if (!parsed.success) {
      return c.json({
        error: 'Invalid request data',
        status: 400,
        detail: parsed.error.issues,
      }, 400);
    }

    if (c.var.db === undefined) {
      return c.status(500);
    }

    const paste = await createPaste(c.var.db, parsed.data.code, parsed.data.language,
      parsed.data.expires);
    return c.json(paste);
  });

app.post('/api/upload',
  withDb,
  async (c) => {
    const parsed = UploadArgs.safeParse(await c.req.parseBody());

    if (!parsed.success) {
      return c.json({
        error: 'Invalid request data',
        status: 400,
        detail: parsed.error.issues,
      }, 400);
    }

    if (c.var.db === undefined) {
      return c.status(500);
    }

    const s3Config: S3Configuration = {
      accessKeyId: c.env.S3_ACCESS_KEY_ID,
      secretAccessKey: c.env.S3_SECRET_ACCESS_KEY,
      bucket: c.env.S3_BUCKET,
      endpointUrl: c.env.S3_ENDPOINT_URL,
      region: c.env.S3_REGION,
    };

    const upload = await createUpload(c.var.db, parsed.data.file, parsed.data.expires, s3Config);
    return c.json(upload);
  });

app.get('/api/info/:id', withDb, async (c) => {
  const id = c.req.param('id');

  if (c.var.db === undefined) {
    return c.status(500);
  }

  if (id) {
    const shortlink = await lookup(c.var.db, id);

    if (shortlink !== null && (shortlink.expiresAt === null || shortlink.expiresAt >= new Date())) {
      return c.json(shortlink);
    }
  }

  return c.json({
    error: 'Short link not found',
    status: 404,
  }, 404);
});

app.get('/:id', withDb, async (c) => {
  let id: string | undefined = c.req.param('id');
  const frontendUrl = getFrontendUrl(c.env.VH7_ENV);
  const direct = c.req.query('direct') !== undefined || checkDirectUserAgent(c.req.header('User-Agent'));

  // sanitise id
  if (!isValidId(id)) {
    id = undefined;
  }

  if (direct === false) {
    if (!id) {
      return c.redirect(frontendUrl, 301);
    }

    return c.redirect(new URL(`/view/${id}`, frontendUrl).href, 301);
  }

  if (!id) {
    return c.text('Short link not found', 404);
  }

  if (c.var.db === undefined) {
    return c.status(500);
  }

  const shortlink = await lookup(c.var.db, id);

  if (shortlink !== null && (shortlink.expiresAt === null || shortlink.expiresAt >= new Date())) {
    switch (shortlink.type) {
      case 'url':
        return c.redirect(shortlink.url, 301);
      case 'paste':
        return c.text(shortlink.code, 200, {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="vh7-paste-${shortlink.id}.txt"`,
          'Cache-Control': 'max-age=86400',
        });
      case 'upload':
        // eslint-disable-next-line no-case-declarations
        const obj = await getObject({
          accessKeyId: c.env.S3_ACCESS_KEY_ID,
          secretAccessKey: c.env.S3_SECRET_ACCESS_KEY,
          bucket: c.env.S3_BUCKET,
          endpointUrl: c.env.S3_ENDPOINT_URL,
          region: c.env.S3_REGION,
        }, shortlink.id);

        if (obj.status === 404) {
          return c.text('Short link not found', 404);
        }

        if (obj.status !== 200) {
          return c.status(500);
        }

        return c.body(obj.body as any, 200, {
          'Content-Type': 'application/force-download',
          'Content-Transfer-Encoding': 'binary',
          'Content-Disposition': `attachment; filename="${shortlink.filename}"`,
          'Cache-Control': 'max-age=86400',
        });
      default:
        return c.status(500);
    }
  }

  return c.text('Short link not found', 404);
});

export default app;
