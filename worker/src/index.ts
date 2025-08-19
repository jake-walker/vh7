import { Hono, type MiddlewareHandler } from 'hono';
import { drizzle, type DrizzleD1Database } from 'drizzle-orm/d1';
import { cors } from 'hono/cors';
import {
  deleteRequestSchema, pasteRequestSchema, pasteResponseSchema, shortLinkRequestSchema, shortLinkResponseSchema, uploadRequestSchema,
  uploadResponseSchema,
} from './schema';
import {
  createPaste, createShortUrl, createUpload, deleteItem, lookup,
} from './controller';
import { checkDirectUserAgent, getFrontendUrl, isValidId } from './helpers';
import * as models from './models';
import cleanup from './cleanup';
import { describeRoute, openAPISpecs } from 'hono-openapi';
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { Scalar } from "@scalar/hono-api-reference";
import z from "zod";

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

app.get("/openapi", openAPISpecs(app, {
  documentation: {
    info: {
      title: "VH7 API",
      version: "2.0.0",
      description: "API for shortening links, pasting code snippets and sharing files"
    },
    servers: [
      {
        url: "http://localhost:8787",
        description: "Local server"
      },
      {
        url: "https://vh7.uk",
        description: "Main instance"
      }
    ]
  }
}));

app.get("/docs", Scalar({
  url: "/openapi",
  theme: "purple",
  pageTitle: "VH7 API Docs"
}));

app.post('/api/shorten',
  describeRoute({
    description: "Create a new shortened URL",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(shortLinkResponseSchema) }
        }
      }
    }
  }),
  zValidator('json', shortLinkRequestSchema),
  withDb,
  async (c) => {
    const parsed = c.req.valid("json");

    if (c.var.db === undefined) {
      return c.status(500);
    }

    const shortUrl = await createShortUrl(c.var.db, parsed.url, parsed.expires,
      parsed.deleteToken);
    return c.json(shortUrl);
  });

app.post('/api/paste',
  describeRoute({
    description: "Create a new shared code snippet",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(pasteResponseSchema) }
        }
      }
    }
  }),
  zValidator('json', pasteRequestSchema),
  withDb,
  async (c) => {
    const parsed = c.req.valid("json");

    if (c.var.db === undefined) {
      return c.status(500);
    }

    const paste = await createPaste(c.var.db, parsed.code, parsed.language,
      parsed.expires, parsed.deleteToken);
    return c.json(paste);
  });

app.post('/api/upload',
  describeRoute({
    description: "Upload a new shared file",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": { schema: resolver(uploadResponseSchema) }
        }
      }
    }
  }),
  zValidator("form", uploadRequestSchema),
  withDb,
  async (c) => {
    const parsed = c.req.valid("form");

    const max = new Date();
    max.setDate(max.getDate() + 31);
    if (parsed.expires === null || parsed.expires > max.getTime()) {
      parsed.expires = max.getTime();
    }

    if (c.var.db === undefined) {
      return c.status(500);
    }

    const upload = await createUpload(c.var.db, c.env.UPLOADS, parsed.file,
      parsed.expires, parsed.deleteToken);
    return c.json(upload);
  });

app.get('/api/info/:id',
  describeRoute({
    description: "Retrieve information on the given short link item",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(z.union([
              shortLinkResponseSchema,
              pasteResponseSchema,
              uploadResponseSchema
            ]))
          }
        }
      }
    }
  }),
  withDb,
  async (c) => {
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

app.delete('/api/delete/:id',
  describeRoute({
    description: "Delete a short link item with it's delete token",
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["deleted", "status"],
              properties: {
                "deleted": { type: "string" },
                status: { type: "number" }
              },
              additionalProperties: false,
              example: {
                deleted: "abcd",
                status: 200
              },
            }
          }
        }
      }
    }
  }),
  zValidator("json", deleteRequestSchema),
  withDb,
  async (c) => {
    const id = c.req.param('id');
    const parsed = c.req.valid("json");

    if (c.var.db === undefined) {
      return c.status(500);
    }

    if (id) {
      const shortlink = await lookup(c.var.db, id);

      if (shortlink !== null && (shortlink.expiresAt === null || shortlink.expiresAt >= new Date())) {
        if (shortlink.deleteToken !== null && parsed.deleteToken === shortlink.deleteToken) {
          await deleteItem(c.var.db, c.env.UPLOADS, shortlink);
          return c.json({
            deleted: shortlink.id,
            status: 200,
          }, 200);
        }

        return c.json({
          error: 'Invalid delete token',
          status: 403,
        }, 403);
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

app.get('/:id',
  withDb,
  async (c) => {
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
