export function checkDirectUserAgent(userAgent: string | undefined): boolean {
  const ua = userAgent?.toLowerCase() || '';
  return (ua.includes('wget') || ua.includes('curl') || ua.includes('axel') || ua.includes('httpie') // cli tools
    || ua.includes('bot ') || ua.includes('bot;') || ua.includes('bot/') // chat & url preview services
    || ua.includes('whatsapp')); // whatsapp & signal
}

export function getFrontendUrl(env: string): string {
  return env === 'development' || env === 'testing'
    ? 'http://localhost:3000'
    : 'https://vh7.uk';
}

export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9]{4}$/.test(id);
}
