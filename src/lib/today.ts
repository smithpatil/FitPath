// "What day is it for THIS user?" A server (like Vercel) usually runs in UTC, so late in the evening
// in India or the US it can already be "tomorrow" on the server. We ask the browser for its time zone
// (saved in a cookie by <TimezoneCookie />) and work out the user's calendar day from that.

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * The calendar day (year, month, day) it is in `timeZone` at moment `now`,
 * returned as a Date at midnight so the other date helpers can use it as-is.
 */
export function dateInTimeZone(now: Date, timeZone: string): Date {
  if (!isValidTimeZone(timeZone)) return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const num = (type: string) => Number(parts.find((p) => p.type === type)!.value);
  return new Date(num("year"), num("month") - 1, num("day"));
}
