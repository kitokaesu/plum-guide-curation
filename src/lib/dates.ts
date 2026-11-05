export const DAY_MS = 86_400_000;
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Midnight UTC for the calendar day containing `date`. */
export function startOfUTCDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function todayISO(): string {
  return isoDate(startOfUTCDay(new Date()));
}

/**
 * The exact DateTime text format Prisma's D1 driver adapter writes
 * (`2026-10-23T00:00:00.000+00:00`). Every raw D1 statement and seed value
 * must use it so that equality, ranges and the unique date index all agree.
 */
export function d1Date(date: Date): string {
  return date.toISOString().replace("Z", "+00:00");
}

export function parseISODate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  if (isoDate(date) !== value) return null;
  return date;
}

export function addDays(date: Date, days: number): Date {
  return new Date(startOfUTCDay(date).getTime() + days * DAY_MS);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1)
  );
}

export function monthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function nightsBetween(checkIn: Date, checkOut: Date): number {
  return Math.round(
    (startOfUTCDay(checkOut).getTime() - startOfUTCDay(checkIn).getTime()) / DAY_MS
  );
}

export function eachNight(checkIn: Date, checkOut: Date): Date[] {
  const nights: Date[] = [];
  const count = nightsBetween(checkIn, checkOut);
  for (let i = 0; i < count; i += 1) nights.push(addDays(checkIn, i));
  return nights;
}

export function eachNightISO(checkInISO: string, checkOutISO: string): string[] {
  const checkIn = parseISODate(checkInISO);
  const checkOut = parseISODate(checkOutISO);
  if (!checkIn || !checkOut) return [];
  return eachNight(checkIn, checkOut).map(isoDate);
}

export function daysUntil(target: Date, from: Date = new Date()): number {
  return Math.round(
    (startOfUTCDay(target).getTime() - startOfUTCDay(from).getTime()) / DAY_MS
  );
}

const shortFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const longFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const dayMonthFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

const weekdayTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatDate(date: Date | string, style: "short" | "long" = "short") {
  const value = typeof date === "string" ? new Date(date) : date;
  return style === "long" ? longFormatter.format(value) : shortFormatter.format(value);
}

export function formatDayMonth(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return dayMonthFormatter.format(value);
}

export function formatDateRange(checkIn: Date | string, checkOut: Date | string) {
  const start = typeof checkIn === "string" ? new Date(checkIn) : checkIn;
  const end = typeof checkOut === "string" ? new Date(checkOut) : checkOut;
  switch (start.getUTCFullYear()) {
    case end.getUTCFullYear():
      if (start.getUTCMonth() === end.getUTCMonth()) {
        return `${start.getUTCDate()}–${dayMonthFormatter.format(end)} ${end.getUTCFullYear()}`;
      }
      return `${dayMonthFormatter.format(start)} – ${dayMonthFormatter.format(end)} ${end.getUTCFullYear()}`;
    default:
      return `${shortFormatter.format(start)} – ${shortFormatter.format(end)}`;
  }
}

export function formatTime(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return timeFormatter.format(value);
}

export function formatDateTime(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return weekdayTimeFormatter.format(value);
}

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export function monthLabel(year: number, monthIndex: number, locale = "en") {
  const names = locale === "pt" ? MONTHS_PT : MONTHS;
  return `${names[monthIndex]} ${year}`;
}

/** Monday-first index (0 = Monday) for a UTC date. */
export function mondayIndex(date: Date) {
  return (date.getUTCDay() + 6) % 7;
}

export function monthGrid(year: number, monthIndex: number): (string | null)[] {
  const first = new Date(Date.UTC(year, monthIndex, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const lead = mondayIndex(first);
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(isoDate(new Date(Date.UTC(year, monthIndex, day))));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
