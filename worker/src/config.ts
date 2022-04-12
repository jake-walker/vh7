export default {
  checkDirectUserAgent(userAgent: string | null): boolean {
    userAgent = userAgent?.toLowerCase() || "";
    return userAgent.includes("wget") || userAgent.includes("curl");
  },
  frontendUrl: (VH7_ENV === 'development'
    ? 'http://localhost:3000'
    : 'http://vh7.uk')
}
