// 4b. GRAPH COLOURING WITH PRE-COLOURED VERTICES (rescheduling after a missed workout)
//
// Vertices  = workout sessions of this week.
// Colours   = days of the week (0 = Monday … 6 = Sunday).
// Edges     = two sessions CONFLICT when they train the same muscle group, or two groups that share
//             muscles (the same conflict list used for the weekly schedule).
//
// Rules for a good schedule (this is a classic "L(2,1) labelling" of a graph):
//   hard:  no two sessions on the same day (one workout a day)
//          sessions you have already started keep their day: they are PRE-COLOURED vertices
//   soft:  conflicting sessions should be at least 2 days apart, so count every conflicting pair
//          that lands on back-to-back days and make that number as small as possible
//   then:  keep each session as close as possible to the day it is "preferred" to be on
//          (a missed session prefers today; an upcoming one prefers its original day)
//
// If there are fewer free days than sessions to place, the PIGEONHOLE principle says some sessions
// cannot fit; we leave out as few as possible (the ones that come last).
import { MUSCLE_CONFLICTS } from "./graphColouring";

export interface Session {
  id: string;
  groups: string[];
  /** Already started or done: keeps this day (a pre-coloured vertex). */
  fixedDay?: number;
  /** For sessions that can move: the day we would like them on. */
  preferredDay?: number;
  /** How bad it is to leave this session out (default 1). Higher = left out only as a last resort. */
  keepWeight?: number;
}

export interface RescheduleResult {
  /** The day of every session, or null if there was no room for it. */
  dayOf: Record<string, number | null>;
  /** Sessions that did not fit (in input order). */
  unplaced: string[];
  /** Conflicting pairs left on back-to-back days (0 is best). */
  consecutiveClashes: number;
  /** The conflict graph between sessions: [idA, idB] pairs. */
  edges: [string, string][];
}

const conflictingGroups = (g: string, h: string): boolean =>
  g === h || MUSCLE_CONFLICTS.some(([a, b]) => (a === g && b === h) || (a === h && b === g));

/** Two sessions conflict if any of their muscle groups conflict. */
export const sessionsConflict = (a: Pick<Session, "groups">, b: Pick<Session, "groups">): boolean =>
  a.groups.some((g) => b.groups.some((h) => conflictingGroups(g, h)));

export function rescheduleSessions(sessions: Session[], availableDays: number[]): RescheduleResult {
  const n = sessions.length;
  const conflict = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i !== j && sessionsConflict(sessions[i], sessions[j])));
  const edges: [string, string][] = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (conflict[i][j]) edges.push([sessions[i].id, sessions[j].id]);

  const day: (number | null)[] = sessions.map((s) => (s.fixedDay === undefined ? null : s.fixedDay));
  const taken = new Set(day.filter((d): d is number => d !== null));
  const free = [...new Set(availableDays)].filter((d) => !taken.has(d)).sort((a, b) => a - b);
  const movable = sessions.map((_, i) => i).filter((i) => sessions[i].fixedDay === undefined);

  // Cost of the pairs already decided: clashes between back-to-back conflicting sessions.
  const clashesOf = (): number => {
    let c = 0;
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++)
        if (conflict[i][j] && day[i] !== null && day[j] !== null && Math.abs(day[i]! - day[j]!) === 1) c++;
    return c;
  };
  // Pairs that are fixed from the start can never change, so they are part of every score.
  const used = new Set<number>();
  let best: { cost: number; day: (number | null)[] } | null = null;

  // Score = (weight of sessions left out) × 1,000,000 + back-to-back clashes × 1,000 + distance from preferred days.
  const search = (k: number, unplaced: number, displacement: number) => {
    const score = unplaced * 1_000_000 + clashesOf() * 1_000 + displacement;
    if (best !== null && score >= best.cost) return; // bound: partial scores only go up
    if (k === movable.length) {
      best = { cost: score, day: [...day] };
      return;
    }
    const i = movable[k];
    const preferred = sessions[i].preferredDay ?? sessions[i].fixedDay ?? 0;
    // Try the days nearest to the preferred day first, so good answers are found early.
    const options = free.filter((d) => !used.has(d)).sort((a, b) => Math.abs(a - preferred) - Math.abs(b - preferred) || a - b);
    for (const d of options) {
      day[i] = d;
      used.add(d);
      search(k + 1, unplaced, displacement + Math.abs(d - preferred));
      used.delete(d);
    }
    day[i] = null; // or leave this session out
    search(k + 1, unplaced + (sessions[i].keepWeight ?? 1), displacement);
  };
  search(0, 0, 0);

  const chosen = best!.day;
  const dayOf: Record<string, number | null> = {};
  sessions.forEach((s, i) => (dayOf[s.id] = chosen[i]));
  day.splice(0, day.length, ...chosen);
  return {
    dayOf,
    unplaced: sessions.filter((s) => dayOf[s.id] === null).map((s) => s.id),
    consecutiveClashes: clashesOf(),
    edges,
  };
}
