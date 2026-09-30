// Builds the live examples for "The Maths Behind It" page from the user's REAL profile and plan.
// It only calls the functions in /lib/math, so what the page shows is exactly what the app computed.
import { EXERCISES } from "../data/exercises";
import { choose, countWeeklyPlans, pigeonhole, type PigeonholeResult } from "./math/combinatorics";
import {
  MUSCLE_CONFLICTS,
  MUSCLE_GROUPS,
  isProperColouring,
  optimalColouring,
  scheduleGroups,
  type Colouring,
  type DaySchedule,
  type Graph,
} from "./math/graphColouring";
import { knapsack, type KnapsackItem, type KnapsackResult } from "./math/knapsack";
import { SAFETY_RULES, firedRules, truthTable, valuationFor, type SafetyRule, type TruthRow } from "./math/logic";
import { inductionProof, overloadPlan, overloadRecurrence, type InductionProof } from "./math/recurrence";
import {
  buildOrder,
  checkEquivalence,
  checkPartialOrder,
  comparable,
  equivalenceClasses,
  equivalent,
  hasseEdges,
  progressionEdges,
  swapOptions,
} from "./math/relations";
import { doableExercises, userEquipmentSet } from "./math/sets";
import type { Edge, Exercise } from "./math/types";
import type { Answers } from "./onboarding";
import { targetFor, usableFor } from "./planGenerator";

const byId = (id: string) => EXERCISES.find((e) => e.id === id)!;

export interface PlanDayInput {
  exerciseIds: string[];
}

export interface MathsExamples {
  sets: {
    universe: string[]; // U
    total: number;
    doableCount: number;
    excludedInDoable: string[]; // names removed by the safety rules
    usableCount: number;
    samples: { name: string; required: string[]; intersection: string[]; doable: boolean }[];
  };
  logic: {
    rule: SafetyRule;
    table: TruthRow[];
    excludedForYou: { name: string; rules: string[] }[];
    excludedTotal: number;
  };
  relations: {
    group: string | null;
    nodes: { id: string; label: string; rank: number }[];
    edges: Edge[];
    properties: ReturnType<typeof checkPartialOrder> | null;
    incomparable: [string, string] | null;
    equivalence: {
      exercise: string;
      members: string[];
      swaps: string[];
      classCount: number;
      properties: ReturnType<typeof checkEquivalence>;
    } | null;
  };
  graph: {
    graph: Graph;
    colouring: Colouring;
    chromaticNumber: number;
    proper: boolean;
    schedule: DaySchedule;
    daysUsed: number;
  };
  counting: {
    pools: { day: number; groups: string[]; available: number; picks: number; ways: bigint }[];
    totalPlans: bigint;
    weekdayChoices: { days: number; ways: bigint };
    groupsIntoDays: PigeonholeResult;
    slotsIntoExercises: PigeonholeResult;
  };
  recurrence: {
    exerciseName: string;
    unit: Exercise["unit"];
    w0: number;
    d: number;
    weeks: { n: number; recurrence: number; closedForm: number }[];
    currentWeek: number;
    currentValue: number;
    cap: number;
    proof: InductionProof;
  };
  knapsack: {
    dayNumber: number;
    items: (KnapsackItem & { name: string })[];
    capacity: number;
    result: KnapsackResult;
    fullDay: { capacity: number; names: string[]; totalMin: number; benefit: number };
  } | null;
}

export function buildMathsExamples(profile: Answers, planDays: PlanDayInput[], weekIndex: number): MathsExamples {
  const usable = usableFor(profile);
  const usableIds = new Set(usable.map((e) => e.id));
  const doable = doableExercises(EXERCISES, profile.equipment);

  /* 1. Sets */
  const U = userEquipmentSet(profile.equipment);
  const doableIds = new Set(doable.map((e) => e.id));
  const excludedInDoable = doable.filter((e) => !usableIds.has(e.id)).map((e) => e.name);
  const samples = ["bodyweight-squat", "goblet-squat", "dead-hang", "lat-pulldown"]
    .map(byId)
    .map((e) => {
      const R = new Set(e.equipment);
      return {
        name: e.name,
        required: [...R],
        intersection: [...R].filter((q) => U.has(q)),
        doable: doableIds.has(e.id),
      };
    });

  /* 2. Logic: show the truth table for the rule that matches one of the user's limits, else R1 */
  const limitRule =
    SAFETY_RULES.find((r) => profile.limitations.some((l) => r.premises.includes(l))) ?? SAFETY_RULES[0];
  const excludedForYou = doable
    .map((e) => ({ e, rules: firedRules(valuationFor(profile, e)) }))
    .filter((x) => x.rules.length > 0)
    .map((x) => ({ name: x.e.name, rules: x.rules.map((r) => r.id) }));

  /* 3. Relations */
  const leq = buildOrder(EXERCISES.map((e) => e.id), progressionEdges(EXERCISES));
  let best: { group: string; ids: string[]; edges: Edge[] } | null = null;
  for (const g of MUSCLE_GROUPS) {
    const ids = usable.filter((e) => e.muscleGroup === g).map((e) => e.id);
    const edges = hasseEdges(ids, leq);
    if (edges.length > (best?.edges.length ?? 0)) best = { group: g, ids, edges };
  }
  let relationsPart: MathsExamples["relations"]["nodes"] = [];
  let poProps: MathsExamples["relations"]["properties"] = null;
  let incomparable: [string, string] | null = null;
  if (best) {
    const inEdges = new Set(best.edges.flat());
    const ids = best.ids.filter((id) => inEdges.has(id));
    // rank = length of the longest chain below the element (easiest = 0)
    const rank = new Map<string, number>(ids.map((id) => [id, 0]));
    for (let pass = 0; pass < ids.length; pass++)
      for (const [a, b] of best.edges) rank.set(b, Math.max(rank.get(b)!, rank.get(a)! + 1));
    relationsPart = ids.map((id) => ({ id, label: byId(id).name, rank: rank.get(id)! }));
    poProps = checkPartialOrder(ids, leq);
    for (const a of ids) {
      for (const b of ids) if (!incomparable && a < b && !comparable(leq, a, b)) incomparable = [byId(a).name, byId(b).name];
    }
  }
  const firstId = planDays[0]?.exerciseIds[0] ?? usable[0]?.id;
  const swapEx = firstId ? byId(firstId) : null;
  const equivalence = swapEx
    ? {
        exercise: swapEx.name,
        members: usable.filter((o) => equivalent(o, swapEx)).map((e) => e.name),
        swaps: swapOptions(swapEx, usable).map((e) => e.name),
        classCount: equivalenceClasses(usable).length,
        properties: checkEquivalence(usable, equivalent),
      }
    : null;

  /* 4. Graph colouring (only muscle groups that have a usable exercise, as in the plan generator) */
  const groups = MUSCLE_GROUPS.filter((g) => usable.some((e) => e.muscleGroup === g));
  const graph: Graph = {
    vertices: groups,
    edges: MUSCLE_CONFLICTS.filter(([a, b]) => groups.includes(a as never) && groups.includes(b as never)),
  };
  const { chromaticNumber, colouring } = optimalColouring(graph);
  const daysUsed = Math.min(profile.days, groups.length);
  const schedule = scheduleGroups(graph, Math.max(1, daysUsed));

  /* 5. Combinatorics + pigeonhole */
  const pools = planDays.map((d, i) => {
    const dayGroups = [...new Set(d.exerciseIds.map((id) => byId(id).muscleGroup as string))];
    const available = usable.filter((e) => dayGroups.includes(e.muscleGroup)).length;
    const picks = d.exerciseIds.length;
    return { day: i + 1, groups: dayGroups, available, picks, ways: choose(available, picks) };
  });
  const totalSlots = planDays.reduce((s, d) => s + d.exerciseIds.length, 0);

  /* 6. Recurrence */
  const firstItem = planDays.flatMap((d) => d.exerciseIds).map(byId).find((e) => e.unit === "reps") ?? (firstId ? byId(firstId) : EXERCISES[0]);
  const w0 = targetFor(firstItem, profile, 0).reps;
  const d = firstItem.unit === "seconds" ? 5 : 1;
  const cap = firstItem.unit === "seconds" ? 60 : w0 + 6;
  const closed = overloadPlan(w0, d, 8);
  const weeks = closed.map((c, n) => ({ n, recurrence: overloadRecurrence(w0, d, n), closedForm: c }));

  /* 7. Knapsack: a small worked example from the first plan day, plus the full-day answer */
  let knap: MathsExamples["knapsack"] = null;
  if (planDays[0]) {
    const dayGroups = new Set(planDays[0].exerciseIds.map((id) => byId(id).muscleGroup as string));
    const candidates = usable
      .filter((e) => dayGroups.has(e.muscleGroup))
      .sort((a, b) => b.benefit - a.benefit || a.id.localeCompare(b.id));
    const toItem = (e: Exercise) => ({ id: e.id, name: e.name, weight: e.durationMin, value: e.benefit });
    const mini = candidates.slice(0, 6).map(toItem);
    const capacity = 15;
    const full = knapsack(candidates.map(toItem), profile.minutes);
    knap = {
      dayNumber: 1,
      items: mini,
      capacity,
      result: knapsack(mini, capacity),
      fullDay: {
        capacity: profile.minutes,
        names: full.chosenIds.map((id) => byId(id).name),
        totalMin: full.totalWeight,
        benefit: full.bestValue,
      },
    };
  }

  return {
    sets: {
      universe: [...U],
      total: EXERCISES.length,
      doableCount: doable.length,
      excludedInDoable,
      usableCount: usable.length,
      samples,
    },
    logic: { rule: limitRule, table: truthTable(limitRule), excludedForYou, excludedTotal: excludedForYou.length },
    relations: { group: best?.group ?? null, nodes: relationsPart, edges: best?.edges ?? [], properties: poProps, incomparable, equivalence },
    graph: { graph, colouring, chromaticNumber, proper: isProperColouring(graph, colouring), schedule, daysUsed },
    counting: {
      pools,
      totalPlans: countWeeklyPlans(pools.map((p) => ({ available: p.available, picks: p.picks }))),
      weekdayChoices: { days: planDays.length, ways: choose(7, planDays.length) },
      groupsIntoDays: pigeonhole(groups.length, Math.max(1, planDays.length || daysUsed)),
      slotsIntoExercises: pigeonhole(totalSlots, Math.max(1, usable.length)),
    },
    recurrence: {
      exerciseName: firstItem.name,
      unit: firstItem.unit,
      w0,
      d,
      weeks,
      currentWeek: weekIndex,
      currentValue: Math.min(w0 + weekIndex * d, cap),
      cap,
      proof: inductionProof(w0, d),
    },
    knapsack: knap,
  };
}
