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

export function parseRangeHeader(header: string): R2Range | undefined {
  const match = header.match(/bytes=(\d+)-(\d*)/);
  if (!match) return;
  const offset = parseInt(match[1], 10);
  const end = match[2] ? parseInt(match[2], 10) : undefined;
  return end !== undefined
    ? { offset, length: end - offset + 1 }
    : { offset };
}
