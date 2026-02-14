export function checkDirectUserAgent(userAgent: string | undefined): boolean {
  const ua = userAgent?.toLowerCase() || "";
  return (
    ua.includes("wget") ||
    ua.includes("curl") ||
    ua.includes("axel") ||
    ua.includes("httpie") || // cli tools
    ua.includes("bot ") ||
    ua.includes("bot;") ||
    ua.includes("bot/") || // chat & url preview services
    ua.includes("whatsapp")
  ); // whatsapp & signal
}

export function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9]{4}$/.test(id) || /^[a-zA-Z0-9]{9}$/.test(id);
}
