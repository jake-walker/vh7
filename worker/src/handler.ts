import { Obj, Router } from 'itty-router';
import { error, json } from 'itty-router-extras';
import {
  createPaste, createShortUrl, createUpload, lookup,
} from './controller';
import { getObject } from './s3';
import { PasteArgs, ShortLinkArgs, UploadArgs } from './schema';
import config from './config';

const router = Router();

const globalHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

type RequestWithContext = Request & {
  data: any | null
};

function wrapCors(response: Response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  return response;
}

async function withContent(request: RequestWithContext) {
  const contentType = request.headers.get('content-type') || '';
  request.data = null;

  if (contentType.includes('application/json')) {
    request.data = await request.json();
  } else if (contentType.includes('form')) {
    const formData = await request.formData();
    request.data = Object.fromEntries(formData);
  }
}

router.get('/', async () => new Response('VH7'));

router.post('/api/shorten', withContent, async (req: RequestWithContext) => {
  const data = await ShortLinkArgs.safeParseAsync(req.data);

  if (!data.success) {
    return wrapCors(error(400, {
      error: 'Invalid request body',
      status: 400,
      detail: data.error.issues,
    }));
  }

  const shortUrl = await createShortUrl(data.data.url, data.data.expires);
  return wrapCors(json(shortUrl));
});

router.post('/api/paste', withContent, async (req: RequestWithContext) => {
  const data = await PasteArgs.safeParseAsync(req.data);

  if (!data.success) {
    return wrapCors(error(400, {
      error: 'Invalid request body',
      status: 400,
      detail: data.error.issues,
    }));
  }

  const paste = await createPaste(data.data.code, data.data.language, data.data.expires);
  return wrapCors(json(paste, { headers: globalHeaders }));
});

router.post('/api/upload', withContent, async (req: RequestWithContext) => {
  const data = await UploadArgs.safeParseAsync(req.data);

  if (!data.success) {
    return wrapCors(error(400, {
      error: 'Invalid request body',
      status: 400,
      detail: data.error.issues,
    }));
  }

  const upload = await createUpload(data.data.file, data.data.expires);
  return wrapCors(json(upload, { headers: globalHeaders }));
});

router.get('/api/info/:id', async ({ params }) => {
  if (params) {
    const shortlink = await lookup(params.id);

    if (shortlink !== null) {
      return wrapCors(json(shortlink, { headers: globalHeaders }));
    }
  }

  return wrapCors(error(404, {
    error: 'Short link not found',
    status: 404,
  }));
});

router.get('/:id', async ({ params, query, headers }: Request & { params: Obj, query: Obj }) => {
  const direct = 'direct' in (query || {}) || config.checkDirectUserAgent(headers.get('User-Agent'));

  if (direct === false) {
    if (!params) {
      return Response.redirect(config.frontendUrl, 301);
    }

    return Response.redirect(`${config.frontendUrl}/view/${params.id}`, 301);
  }

  if (!params) {
    return new Response('Short link not found', { status: 404 });
  }

  const shortlink = await lookup(params.id);

  if (shortlink !== null) {
    switch (shortlink.type) {
      case 'url:1':
        return Response.redirect(shortlink.url, 301);
      case 'paste:1':
        // eslint-disable-next-line no-case-declarations
        const pasteRes = new Response(shortlink.code);
        pasteRes.headers.set('Content-Type', 'text/plain');
        pasteRes.headers.set('Content-Disposition', `attachment; filename="vh7-paste-${shortlink.id}.txt"`);
        pasteRes.headers.set('Cache-Control', 'max-age=86400');
        return pasteRes;
      case 'upload:1':
        // eslint-disable-next-line no-case-declarations
        const obj = await getObject(shortlink.id);
        if (obj.status === 404) {
          return new Response('Short link not found', { status: 404 });
        }
        if (obj.status !== 200) {
          return new Response('Internal server error', { status: 500 });
        }
        // eslint-disable-next-line no-case-declarations
        const res = new Response(obj.body, obj);
        res.headers.set('Content-Type', 'application/force-download');
        res.headers.set('Content-Transfer-Encoding', 'binary');
        res.headers.set('Content-Disposition', `attachment; filename="${shortlink.filename}"`);
        res.headers.set('Cache-Control', 'max-age=86400');
        return res;
      default:
        return new Response('Internal server error', { status: 500 });
    }
  }

  return new Response('Short link not found', { status: 404 });
});

router.all('*', () => new Response('Not found!', { status: 404 }));

export default async function handleRequest(request: Request): Promise<Response> {
  // Respond to CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        ...globalHeaders,
        Allow: 'GET, OPTIONS, POST',
      },
      status: 204,
    });
  }

  return router.handle(request);
}
