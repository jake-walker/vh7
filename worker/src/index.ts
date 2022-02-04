import handleRequest from './handler';

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', async (event) => {
  const res = handleRequest(event.request);
  // cache for 1 day
  // res.headers.set('Cache-Control', 'max-age=86400');
  event.respondWith(res);
});
