/**
 * Shared calendar-sync utilities for bookings, lessons, events, and consultations.
 * Generates Google Calendar links and downloadable .ics files compatible with
 * Apple Calendar, Outlook, and other calendar apps.
 */

export interface CalendarEvent {
  title: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** HH:MM 24-hour format */
  startTime?: string;
  /** HH:MM 24-hour format */
  endTime?: string;
  /** Fallback duration in minutes if endTime isn't provided */
  durationMinutes?: number;
  description?: string;
  location?: string;
}

const DEFAULT_LOCATION = "Peninsula Equine, 59 Tubbarubba Rd, Merricks North VIC 3926";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function parseTime(time?: string): { h: number; m: number } {
  if (!time) return { h: 9, m: 0 };
  const [h, m] = time.split(":").map(Number);
  return { h: h ?? 9, m: m ?? 0 };
}

function toCalDateStr(date: string, time?: string): string {
  const [y, mo, d] = date.split("-").map(Number);
  const { h, m } = parseTime(time);
  return `${y}${pad(mo)}${pad(d)}T${pad(h)}${pad(m)}00`;
}

function getEndDateStr(date: string, startTime?: string, endTime?: string, durationMinutes = 60): string {
  if (endTime) return toCalDateStr(date, endTime);
  const { h, m } = parseTime(startTime);
  const start = new Date(2000, 0, 1, h, m);
  start.setMinutes(start.getMinutes() + durationMinutes);
  return toCalDateStr(date, `${pad(start.getHours())}:${pad(start.getMinutes())}`);
}

/**
 * Build a Google Calendar "create event" URL.
 */
export function buildGoogleCalendarUrl(event: CalendarEvent): string {
  const start = toCalDateStr(event.date, event.startTime);
  const end = getEndDateStr(event.date, event.startTime, event.endTime, event.durationMinutes);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description || "",
    location: event.location || DEFAULT_LOCATION,
    ctz: "Australia/Melbourne",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an ICS file string.
 */
export function buildICSContent(event: CalendarEvent): string {
  const dtStart = toCalDateStr(event.date, event.startTime);
  const dtEnd = getEndDateStr(event.date, event.startTime, event.endTime, event.durationMinutes);
  const uid = `pe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@peninsulaequine.com`;
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peninsula Equine//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=Australia/Melbourne:${dtStart}`,
    `DTEND;TZID=Australia/Melbourne:${dtEnd}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${(event.description || "").replace(/\n/g, "\\n").slice(0, 300)}`,
    `LOCATION:${event.location || DEFAULT_LOCATION}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Booking reminder — 1 hour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

/**
 * Trigger an .ics file download in the browser.
 */
export function downloadICSFile(event: CalendarEvent): void {
  const content = buildICSContent(event);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
