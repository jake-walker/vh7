import type { operations } from "./api.g";

type EventData = operations["postApiEvent"]["responses"][200]["content"]["application/json"];

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

export function googleCalendarUrl(event: EventData): string {
  const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const params = new URLSearchParams({
    text: event.title,
    dates: `${toICSDate(event.startDate)}/${toICSDate(event.endDate ?? addHours(new Date(event.startDate), 1))}`,
    details: event.description || "",
    location: event.location || "",
  });
  return `${baseUrl}&${params.toString()}`;
}

export function outlookCalendarUrl(event: EventData): string {
  const baseUrl = "https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose";

  const paramsData: { [key: string]: string } = {
    subject: event.title,
    startdt: event.startDate,
    body: event.description || "",
    location: event.location || "",
  };

  if (event.endDate !== null) {
    paramsData.enddt = event.endDate;
  }

  const params = new URLSearchParams(paramsData);
  return `${baseUrl}&${params.toString()}`;
}
