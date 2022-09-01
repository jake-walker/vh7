export default {
  checkDirectUserAgent(userAgent: string | null): boolean {
    const ua = userAgent?.toLowerCase() || '';
    return (ua.includes('wget') || ua.includes('curl') || ua.includes('axel') // cli tools
      || ua.includes('bot ') || ua.includes('bot;') || ua.includes('bot/') // chat & url preview services
      || ua.includes('whatsapp')); // whatsapp & signal
  },
  frontendUrl: (VH7_ENV === 'development'
    ? 'http://localhost:3000'
    : 'http://vh7.uk'),
};
