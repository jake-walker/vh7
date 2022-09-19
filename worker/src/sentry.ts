import Toucan, { Options } from 'toucan-js';

export default function initSentry(event: FetchEvent, additionalOptions?: Options) {
  const { request } = event;

  const sentry = new Toucan({
    dsn: SENTRY_DSN,
    event,
    allowedHeaders: [
      'user-agent',
      'cf-challenge',
      'accept-encoding',
      'accept-language',
      'cf-ray',
      'content-length',
      'content-type',
      'x-real-ip',
      'host',
    ],
    allowedSearchParams: /(.*)/,
    rewriteFrames: {
      root: '/',
    },
    transportOptions: {
      headers: {
        'CF-Access-Client-ID': SENTRY_CLIENT_ID,
        'CF-Access-Client-Secret': SENTRY_CLIENT_SECRET,
      },
    },
    environment: VH7_ENV,
    ...additionalOptions,
  });
  const colo = request.cf && request.cf.colo ? request.cf.colo : 'UNKNOWN';
  sentry.setTag('colo', colo);

  // cf-connecting-ip should always be present, but if not we can fallback to XFF.
  const ipAddress = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for');
  const userAgent = request.headers.get('user-agent') || '';
  sentry.setUser({ ip: ipAddress, userAgent, colo });
  return sentry;
}
