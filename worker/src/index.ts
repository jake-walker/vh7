import { Sentry } from '@borderless/worker-sentry';
import handleRequest from './handler';

const sentry = new Sentry({
  dsn: 'https://76633f6f29b042efac24b55b6a9e5965@o170830.ingest.sentry.io/6724319',
});

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', async (event) => {
  try {
    const res = handleRequest(event.request);
    // cache for 1 day
    // res.headers.set('Cache-Control', 'max-age=86400');
    event.respondWith(res);
  } catch (err: any) {
    event.waitUntil(sentry.captureException(err, {
      tags: {},
      user: {
        ip: event.request.headers.get('cf-connecting-ip') || undefined,
      },
    }));

    event.respondWith(new Response('Internal Server Error', { status: 500 }));
  }
});
