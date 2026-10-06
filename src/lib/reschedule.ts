// Turns this week's plan into a rescheduling problem (see math/sessionColouring.ts) and back.
import { rescheduleSessions, type Session } from "./math/sessionColouring";

export interface SessionInfo {
  /** The training-day slot (plan_items.day). */
  slot: number;
  groups: string[];
  /** Weekday it is currently on (0 = Monday). */
  weekday: number;
  /** At least one exercise is already done. */
  started: boolean;
}

export interface ReschedulePlan {
  /** Slots that were skipped: not started and their day has passed. */
  missed: number[];
  /** New weekday for every slot that can be placed (includes ones that did not change). */
  newWeekday: Record<number, number>;
  /** Slots that changed day. */
  moved: number[];
  /** Missed slots that have no free day left this week. */
  noRoom: number[];
  consecutiveClashes: number;
  /** The colouring problem that was solved (sessions and their conflict lines). */
  sessions: Session[];
  edges: [string, string][];
}

/**
 * Re-colour the rest of the week:
 *   started sessions keep their day (pre-coloured), everything else can move to today … Sunday.
 * A missed session prefers today; an upcoming one prefers the day it was already on.
 */
export function planReschedule(sessions: SessionInfo[], todayWeekday: number): ReschedulePlan {
  const missed = sessions.filter((s) => !s.started && s.weekday < todayWeekday).map((s) => s.slot);
  const problem: Session[] = sessions.map((s) => ({
    id: String(s.slot),
    groups: s.groups,
    fixedDay: s.started ? s.weekday : undefined,
    preferredDay: missed.includes(s.slot) ? todayWeekday : s.weekday,
    keepWeight: missed.includes(s.slot) ? 1 : 2, // never drop an upcoming workout before a missed one
  }));
  const available = Array.from({ length: 7 - todayWeekday }, (_, i) => todayWeekday + i);
  const result = rescheduleSessions(problem, available);

  const newWeekday: Record<number, number> = {};
  const noRoom: number[] = [];
  for (const s of sessions) {
    const d = result.dayOf[String(s.slot)];
    if (d === null || d === undefined) {
      noRoom.push(s.slot);
      newWeekday[s.slot] = s.weekday; // stays where it was (still counted as missed)
    } else newWeekday[s.slot] = d;
  }
  // Nothing was missed: leave the plan exactly as it is.
  if (missed.length === 0) {
    return { missed, newWeekday: Object.fromEntries(sessions.map((s) => [s.slot, s.weekday])), moved: [], noRoom: [], consecutiveClashes: result.consecutiveClashes, sessions: problem, edges: result.edges };
  }
  return {
    missed,
    newWeekday,
    moved: sessions.filter((s) => newWeekday[s.slot] !== s.weekday).map((s) => s.slot),
    noRoom,
    consecutiveClashes: result.consecutiveClashes,
    sessions: problem,
    edges: result.edges,
  };
}
