export default {
  checkDirectUserAgent(userAgent: string | null): boolean {
    userAgent = userAgent?.toLowerCase() || "";
    return (userAgent.includes("wget") || userAgent.includes("curl") || userAgent.includes("axel")  // cli tools
      || userAgent.includes("bot ") || userAgent.includes("bot;") || userAgent.includes("bot/")  // chat & url preview services
      || userAgent.includes("whatsapp"));  // whatsapp & signal
  },
  frontendUrl: (VH7_ENV === 'development'
    ? 'http://localhost:3000'
    : 'http://vh7.uk')
}
