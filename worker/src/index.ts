import initSentry from './sentry';
import handleRequest from './handler';

// eslint-disable-next-line no-restricted-globals
addEventListener('fetch', (event) => {
  const sentry = initSentry(event);
  event.respondWith(handleRequest(event.request, sentry));
});
