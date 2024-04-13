import { Hono, type MiddlewareHandler } from 'hono';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { cors } from 'hono/cors';
import { PasteArgs, ShortLinkArgs, UploadArgs } from './schema';
import {
  createPaste, createShortUrl, createUpload, lookup,
} from './controller';
import { checkDirectUserAgent, getFrontendUrl, isValidId } from './helpers';
import * as models from './models';
import cleanup from './cleanup';

export type Bindings = {
  DB: D1Database,
  VH7_ENV: string,
  UPLOADS: R2Bucket,
  VH7_ADMIN_TOKEN: string
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

    const shortUrl = await createShortUrl(c.var.db, parsed.data.url, parsed.data.expires,
      parsed.data.deleteToken);
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
      parsed.data.expires, parsed.data.deleteToken);
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

    const max = new Date();
    max.setDate(max.getDate() + 31);
    if (parsed.data.expires === null || parsed.data.expires > max.getTime()) {
      parsed.data.expires = max.getTime();
    }

    if (c.var.db === undefined) {
      return c.status(500);
    }

    const upload = await createUpload(c.var.db, c.env.UPLOADS, parsed.data.file,
      parsed.data.expires, parsed.data.deleteToken);
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
      return c.json({ ...shortlink, deleteToken: undefined });
    }
  }

  return c.json({
    error: 'Short link not found',
    status: 404,
  }, 404);
});

app.get('/api/cleanup', withDb, async (c) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '') || '';

  if (token !== c.env.VH7_ADMIN_TOKEN) {
    return c.text('Invalid or non-existant admin token', 403);
  }

  if (c.var.db === undefined) {
    return c.status(500);
  }

  const deleted = await cleanup(c.var.db, c.env.UPLOADS);
  return c.json({
    deleted,
  });
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
        const obj = await c.env.UPLOADS.get(shortlink.id);

        if (obj === null) {
          return c.text('Short link not found', 404);
        }

        return c.body(obj.body, 200, {
          'Content-Type': 'application/force-download',
          'Content-Transfer-Encoding': 'binary',
          'Content-Disposition': `attachment; filename="${shortlink.filename}"`,
          'Cache-Control': 'max-age=86400',
          etag: obj.httpEtag,
        });
      default:
        return c.status(500);
    }
  }

  return c.text('Short link not found', 404);
});

export default app;
