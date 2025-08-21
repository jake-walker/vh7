import type { ShortLink, ShortLinkEvent } from "./models";

function icalEscape(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function toICSDate(date: Date | string): string {
  const dt = new Date(date);
  return (
    dt.getUTCFullYear().toString() +
    (dt.getUTCMonth() + 1).toString().padStart(2, "0") +
    dt.getUTCDate().toString().padStart(2, "0") +
    "T" +
    dt.getUTCHours().toString().padStart(2, "0") +
    dt.getUTCMinutes().toString().padStart(2, "0") +
    dt.getUTCSeconds().toString().padStart(2, "0") +
    "Z"
  );
}

export function addHours(d: Date, hours: number): Date {
  const result = new Date(d.getTime());
  result.setHours(result.getHours() + hours);
  return result;
}

export function buildIcs(event: ShortLinkEvent & ShortLink, hostname: string): string {
  const uid = `${event.id}@${hostname}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vh7Events//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(event.createdAt)}`,
    `DTSTART:${toICSDate(event.startDate)}`,
    `DTEND:${toICSDate(event.endDate ?? addHours(event.startDate, 1))}`,
    `SUMMARY:${icalEscape(event.title)}`,
    event.description !== null && `DESCRIPTION:${icalEscape(event.description)}`,
    event.location !== null && `LOCATION:${icalEscape(event.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
