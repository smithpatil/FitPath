// Warm-up and cool-down for a user. Uses SET DIFFERENCE and the LOGIC rules from the maths library:
//   safe moves = all moves − { moves where a safety rule fires }
// then takes moves in order of preference until the time is filled (never going over).
import { COOLDOWN_MOVES, COOLDOWN_SECONDS, WARMUP_MOVES, WARMUP_SECONDS, type RoutineMove } from "../data/warmups";
import { isExcluded, valuationFor } from "./math/logic";
import type { Level, Limitation } from "./math/types";

type User = { level: Level; limitations: Limitation[] };

export const safeMoves = (moves: RoutineMove[], user: User): RoutineMove[] =>
  moves.filter((m) => !isExcluded(valuationFor(user, m)));

export function buildRoutine(moves: RoutineMove[], user: User, targetSeconds: number): RoutineMove[] {
  const out: RoutineMove[] = [];
  let total = 0;
  for (const m of safeMoves(moves, user)) {
    if (total + m.seconds > targetSeconds) continue;
    out.push(m);
    total += m.seconds;
  }
  return out;
}

export const warmupFor = (user: User) => buildRoutine(WARMUP_MOVES, user, WARMUP_SECONDS);
export const cooldownFor = (user: User) => buildRoutine(COOLDOWN_MOVES, user, COOLDOWN_SECONDS);

export const totalSeconds = (moves: RoutineMove[]) => moves.reduce((s, m) => s + m.seconds, 0);
