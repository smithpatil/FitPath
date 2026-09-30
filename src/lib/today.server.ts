import { cookies } from "next/headers";
import { dateInTimeZone, isValidTimeZone } from "./today";

/** Today's calendar day in the user's own time zone (falls back to UTC before the cookie exists). */
export async function getToday(): Promise<Date> {
  const raw = (await cookies()).get("tz")?.value;
  let tz = "UTC";
  if (raw) {
    const decoded = decodeURIComponent(raw);
    if (isValidTimeZone(decoded)) tz = decoded;
  }
  return dateInTimeZone(new Date(), tz);
}
