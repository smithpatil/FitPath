import { describe, expect, it } from "vitest";
import { planReschedule, type SessionInfo } from "./reschedule";

// A 3-day plan on Mon / Wed / Fri.
const week = (started: number[] = []): SessionInfo[] => [
  { slot: 0, groups: ["legs", "core"], weekday: 0, started: started.includes(0) },
  { slot: 1, groups: ["chest", "back"], weekday: 2, started: started.includes(1) },
  { slot: 2, groups: ["shoulders", "arms"], weekday: 4, started: started.includes(2) },
];

describe("planReschedule", () => {
  it("does nothing when no workout was missed", () => {
    const p = planReschedule(week([0]), 1); // Monday done, today is Tuesday
    expect(p.missed).toEqual([]);
    expect(p.moved).toEqual([]);
    expect(p.newWeekday).toEqual({ 0: 0, 1: 2, 2: 4 });
  });

  it("a missed Monday workout moves to today (Tuesday); upcoming ones stay if there is no clash", () => {
    const p = planReschedule(week(), 1);
    expect(p.missed).toEqual([0]);
    expect(p.newWeekday[0]).toBe(1);
    expect(p.newWeekday[1]).toBe(2);
    expect(p.newWeekday[2]).toBe(4);
    expect(p.moved).toEqual([0]);
    expect(p.noRoom).toEqual([]);
  });

  it("started sessions are never moved", () => {
    const p = planReschedule(week([1]), 3); // Wednesday's was done; today is Thursday; Monday missed
    expect(p.newWeekday[1]).toBe(2);
    expect(p.missed).toEqual([0]);
    expect(p.newWeekday[0]).toBeGreaterThanOrEqual(3);
  });

  it("every placed session gets a different day, all from today onwards", () => {
    const p = planReschedule(week(), 3);
    const placed = [0, 1, 2].filter((s) => !p.noRoom.includes(s)).map((s) => p.newWeekday[s]);
    expect(new Set(placed).size).toBe(placed.length);
    for (const d of placed) expect(d).toBeGreaterThanOrEqual(3);
  });

  it("when there is no room, missed sessions are left out, never the upcoming ones", () => {
    // a 6-day plan (Mon..Sat); today is Friday, so Mon..Thu were missed and only Fri, Sat, Sun are free
    const sixDays: SessionInfo[] = [
      ["legs"], ["chest"], ["back"], ["core"], ["glutes"], ["cardio"],
    ].map((groups, slot) => ({ slot, groups, weekday: slot, started: false }));
    const p = planReschedule(sixDays, 4);
    expect(p.missed).toEqual([0, 1, 2, 3]);
    expect(p.noRoom.length).toBe(3); // 6 sessions, 3 free days: pigeonhole
    for (const slot of p.noRoom) expect(p.missed).toContain(slot);
    expect(p.noRoom).not.toContain(4); // Friday's session is safe
    expect(p.noRoom).not.toContain(5); // Saturday's session is safe
    for (const slot of p.noRoom) expect(p.newWeekday[slot]).toBe(sixDays[slot].weekday); // left-out ones keep their old day
  });

  it("returns the conflict graph between sessions for display", () => {
    const p = planReschedule(week(), 1);
    expect(p.sessions).toHaveLength(3);
    // chest+back (slot 1) conflicts with shoulders+arms (slot 2): chest-shoulders
    expect(p.edges).toContainEqual(["1", "2"]);
  });
});
