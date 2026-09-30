import { describe, expect, it } from "vitest";
import { toISODate } from "./dates";
import { dateInTimeZone, isValidTimeZone } from "./today";

// 30 Sep 2026, 22:00 UTC
const moment = new Date(Date.UTC(2026, 8, 30, 22, 0, 0));

describe("dateInTimeZone", () => {
  it("UTC stays on the same day", () => {
    expect(toISODate(dateInTimeZone(moment, "UTC"))).toBe("2026-09-30");
  });
  it("India (UTC+5:30) is already the next day", () => {
    expect(toISODate(dateInTimeZone(moment, "Asia/Kolkata"))).toBe("2026-10-01");
  });
  it("US Pacific is still the same day, earlier hours", () => {
    expect(toISODate(dateInTimeZone(moment, "America/Los_Angeles"))).toBe("2026-09-30");
  });
  it("New Zealand is far ahead", () => {
    expect(toISODate(dateInTimeZone(moment, "Pacific/Auckland"))).toBe("2026-10-01");
  });
  it("a bad time zone falls back safely instead of crashing", () => {
    expect(isValidTimeZone("Not/AZone")).toBe(false);
    expect(dateInTimeZone(moment, "Not/AZone")).toBeInstanceOf(Date);
  });
});
