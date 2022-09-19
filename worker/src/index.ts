import initSentry from './sentry';
import handleRequest from './handler';

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', async (event) => {
  const sentry = initSentry(event);
  event.respondWith(handleRequest(event.request, sentry));
});
