import { describe, expect, it } from "vitest";
import { EXERCISES } from "../data/exercises";
import { ROUTINE_MINUTES, chooseSwap, exerciseMinutes, generatePlan, targetFor, usableFor, weekdayForSlot } from "./planGenerator";
import { MUSCLE_CONFLICTS } from "./math/graphColouring";
import type { Answers } from "./onboarding";

const byId = (id: string) => EXERCISES.find((e) => e.id === id)!;

const base: Answers = {
  goal: "stay_active",
  level: "beginner",
  days: 3,
  minutes: 30,
  equipment: [],
  limitations: [],
};

describe("generatePlan", () => {
  it("makes the requested number of days, each within the time limit", () => {
    for (const days of [2, 3, 4, 5, 6])
      for (const minutes of [15, 30, 60]) {
        const plan = generatePlan({ ...base, days, minutes }, 0);
        expect(plan.days).toHaveLength(days);
        // the 5-minute warm-up + cool-down come out of the same minutes
        for (const d of plan.days) expect(d.totalMin + ROUTINE_MINUTES).toBeLessThanOrEqual(minutes);
      }
  });
  it("includes cardio somewhere in the week, measured in minutes as one block", () => {
    for (const equipment of [[], ["gym"]] as Answers["equipment"][]) {
      const plan = generatePlan({ ...base, equipment, days: 3, minutes: 45 }, 0);
      const cardio = plan.days.flatMap((d) => d.items).filter((i) => byId(i.exerciseId).muscleGroup === "cardio");
      expect(cardio.length).toBeGreaterThan(0);
      for (const c of cardio) {
        expect(c.sets).toBe(1);
        expect(c.reps).toBe(byId(c.exerciseId).durationMin);
      }
    }
  });
  it("cardio and legs never share a day when days ≥ 3 (they conflict in the graph)", () => {
    const plan = generatePlan({ ...base, days: 4 }, 0);
    for (const d of plan.days) expect(d.groups.includes("cardio") && d.groups.includes("legs")).toBe(false);
  });
  it("sore knees get no jumping cardio", () => {
    const ids = usableFor({ ...base, limitations: ["knee"] }).map((e) => e.id);
    expect(ids).not.toContain("jumping-jacks");
    expect(ids).not.toContain("high-knees");
    expect(ids).toContain("brisk-walk");
  });
  it("exerciseMinutes leaves room for the warm-up and cool-down", () => {
    expect(exerciseMinutes(30)).toBe(25);
    expect(exerciseMinutes(3)).toBe(0);
  });
  it("only uses usable exercises (equipment + safety rules)", () => {
    const profile: Answers = { ...base, level: "some_experience", equipment: ["dumbbells"], limitations: ["knee", "wrist"] };
    const usable = new Set(usableFor(profile).map((e) => e.id));
    const plan = generatePlan(profile, 0);
    for (const d of plan.days) for (const i of d.items) expect(usable.has(i.exerciseId)).toBe(true);
    const all = plan.days.flatMap((d) => d.items.map((i) => i.exerciseId));
    expect(all).not.toContain("jump-squat");
    expect(all).not.toContain("push-up");
  });
  it("beginners never get difficulty-3 exercises", () => {
    const plan = generatePlan({ ...base, equipment: ["dumbbells", "resistance_band", "pull_up_bar"], days: 6, minutes: 60 }, 0);
    for (const d of plan.days) for (const i of d.items) expect(byId(i.exerciseId).difficulty).toBeLessThan(3);
  });
  it("each item belongs to a muscle group listed that day, and no exercise repeats within a day", () => {
    const plan = generatePlan({ ...base, days: 4, minutes: 45, equipment: ["dumbbells"] }, 0);
    for (const d of plan.days) {
      const ids = d.items.map((i) => i.exerciseId);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(d.groups).toContain(byId(id).muscleGroup);
    }
  });
  it("the minutes are PER WORKOUT DAY: with equipment, every day fills most of a 60-minute session", () => {
    const profile: Answers = { ...base, equipment: ["dumbbells", "resistance_band", "pull_up_bar"], minutes: 60 };
    for (const days of [2, 3]) {
      const plan = generatePlan({ ...profile, days }, 0);
      expect(plan.days).toHaveLength(days);
      for (const d of plan.days) {
        expect(d.totalMin).toBeLessThanOrEqual(60);
        expect(d.totalMin).toBeGreaterThanOrEqual(35);
      }
    }
  });
  it("filling a day with extra groups never puts conflicting groups on the same day", () => {
    for (const days of [3, 4, 5]) {
      const plan = generatePlan({ ...base, days, minutes: 60, equipment: ["dumbbells", "resistance_band", "pull_up_bar"] }, 0);
      for (const d of plan.days)
        for (const [a, b] of MUSCLE_CONFLICTS) expect(d.groups.includes(a) && d.groups.includes(b)).toBe(false);
    }
  });
  it("conflicting muscle groups never share a day when days ≥ 3", () => {
    const plan = generatePlan({ ...base, days: 3 }, 0);
    for (const d of plan.days) {
      expect(d.groups.includes("chest") && d.groups.includes("shoulders")).toBe(false);
      expect(d.groups.includes("legs") && d.groups.includes("glutes")).toBe(false);
    }
  });
  it("with enough time every muscle group of a day is included", () => {
    const plan = generatePlan({ ...base, days: 3, minutes: 60 }, 0);
    for (const d of plan.days) {
      const groupsDone = new Set(d.items.map((i) => byId(i.exerciseId).muscleGroup));
      for (const g of d.groups) expect(groupsDone.has(g as never)).toBe(true);
    }
  });
  it("the knapsack result is at least as good as the reserved starters (uses spare minutes)", () => {
    const short = generatePlan({ ...base, days: 6, minutes: 15 }, 0);
    const long = generatePlan({ ...base, days: 6, minutes: 60 }, 0);
    const sum = (p: typeof short) => p.days.reduce((s, d) => s + d.benefit, 0);
    expect(sum(long)).toBeGreaterThan(sum(short));
  });
  it("is deterministic", () => {
    expect(generatePlan(base, 2)).toEqual(generatePlan(base, 2));
  });
  it("hard cases still give non-empty days (wrist + lower back + shoulder + knee, no equipment)", () => {
    const plan = generatePlan({ ...base, days: 6, limitations: ["wrist", "lower_back", "shoulder", "knee"] }, 0);
    expect(plan.days.length).toBeGreaterThan(0);
    for (const d of plan.days) expect(d.items.length).toBeGreaterThan(0);
  });
});

describe("gym members", () => {
  const gym: Answers = { ...base, equipment: ["gym"], minutes: 60 };
  it("get gym exercises, and only usable ones", () => {
    const plan = generatePlan({ ...gym, days: 3 }, 0);
    const ids = plan.days.flatMap((d) => d.items.map((i) => i.exerciseId));
    const usable = new Set(usableFor(gym).map((e) => e.id));
    expect(ids.some((id) => byId(id).equipment.includes("gym"))).toBe(true);
    for (const id of ids) expect(usable.has(id)).toBe(true);
  });
  it("fill every 60-minute workout day (2-3 days: fully; 4-6 days: a day with one small muscle group can be shorter)", () => {
    for (const days of [2, 3, 4, 5, 6]) {
      const plan = generatePlan({ ...gym, days }, 0);
      for (const d of plan.days) {
        expect(d.totalMin).toBeLessThanOrEqual(60);
        expect(d.totalMin).toBeGreaterThanOrEqual(days <= 3 ? 55 : 30);
      }
    }
  });
  it("still respect safety rules (knee + beginner: no barbell squat, jump squat or leg press)", () => {
    const ids = usableFor({ ...gym, limitations: ["knee"] }).map((e) => e.id);
    for (const bad of ["barbell-back-squat", "jump-squat", "leg-press", "leg-extension-machine"]) expect(ids).not.toContain(bad);
    expect(ids).toContain("leg-curl-machine");
  });
  it("beginners get machines, not the hard barbell lifts", () => {
    const ids = usableFor(gym).map((e) => e.id);
    expect(ids).not.toContain("barbell-bench-press");
    expect(ids).toContain("machine-chest-press");
  });
  it("swapping a gym exercise gives another gym exercise for the same muscle group", () => {
    const usable = usableFor(gym);
    const swap = chooseSwap(byId("lat-pulldown"), usable, ["lat-pulldown"], 5, 60)!;
    expect(swap.muscleGroup).toBe("back");
    expect(swap.equipment).toEqual(["gym"]);
  });
});

describe("progressive overload in targets", () => {
  it("reps rise by 1 each week then stop at the cap", () => {
    const squat = byId("bodyweight-squat");
    const p = { goal: "stay_active", level: "beginner" } as const;
    expect(targetFor(squat, p, 0).reps).toBe(10);
    expect(targetFor(squat, p, 3).reps).toBe(13);
    expect(targetFor(squat, p, 50).reps).toBe(16);
  });
  it("timed exercises add 5 seconds a week, up to 60", () => {
    const plank = byId("plank");
    const p = { goal: "stay_active", level: "beginner" } as const;
    expect(targetFor(plank, p, 0).reps).toBe(20);
    expect(targetFor(plank, p, 2).reps).toBe(30);
    expect(targetFor(plank, p, 99).reps).toBe(60);
  });
  it("beginners do 2 sets, others 3", () => {
    const squat = byId("bodyweight-squat");
    expect(targetFor(squat, { goal: "stay_active", level: "beginner" }, 0).sets).toBe(2);
    expect(targetFor(squat, { goal: "stay_active", level: "some_experience" }, 0).sets).toBe(3);
  });
});

describe("chooseSwap (equivalence class)", () => {
  const usable = usableFor(base);
  it("returns a same-group, same-equipment exercise that is not already in the workout", () => {
    const squat = byId("bodyweight-squat");
    const swap = chooseSwap(squat, usable, ["bodyweight-squat"], 5, 30)!;
    expect(swap).not.toBeNull();
    expect(swap.muscleGroup).toBe("legs");
    expect(swap.equipment).toEqual(["bodyweight"]);
    expect(swap.id).not.toBe("bodyweight-squat");
  });
  it("respects the time limit", () => {
    const squat = byId("bodyweight-squat"); // 5 min; lunge is 6 min
    expect(chooseSwap(squat, usable, ["bodyweight-squat"], 30, 30)?.durationMin ?? 0).toBeLessThanOrEqual(5);
  });
  it("returns null when nothing else is in the class", () => {
    const band = byId("band-squat"); // the only leg + band exercise
    expect(chooseSwap(band, usableFor({ ...base, equipment: ["resistance_band"] }), ["band-squat"], 5, 30)).toBeNull();
  });
});

describe("weekdays", () => {
  it("spreads training days out", () => {
    expect([0, 1, 2].map((s) => weekdayForSlot(3, s))).toEqual([0, 2, 4]);
    expect([0, 1].map((s) => weekdayForSlot(2, s))).toEqual([0, 3]);
  });
});

describe("workout styles in the plan", () => {
  const yoga: Answers = { ...base, format: "yoga", equipment: [] };
  const allIds = (plan: ReturnType<typeof generatePlan>) => plan.days.flatMap((d) => d.items.map((i) => i.exerciseId));

  it("yoga plans use only yoga poses; gym and strength plans never do", () => {
    for (const days of [2, 3, 5]) {
      for (const id of allIds(generatePlan({ ...yoga, days, minutes: 45 }, 0))) expect(byId(id).style).toBe("yoga");
      for (const profile of [{ ...base, format: "gym" as const, equipment: ["gym" as const] }, { ...base, format: "strength" as const }])
        for (const id of allIds(generatePlan({ ...profile, days, minutes: 45 }, 0))) expect(byId(id).style).toBeUndefined();
    }
  });

  it("yoga plans fit the minutes of each day (after the 5-minute warm-up and cool-down)", () => {
    for (const days of [2, 3, 4, 6])
      for (const minutes of [15, 30, 60]) {
        const plan = generatePlan({ ...yoga, days, minutes }, 0);
        expect(plan.days.length).toBeGreaterThan(0);
        for (const d of plan.days) expect(d.totalMin + ROUTINE_MINUTES).toBeLessThanOrEqual(minutes);
      }
  });

  it("yoga poses are held once: 30 seconds for newcomers (45 otherwise), 5 seconds longer each step, never above 90", () => {
    const pose = byId("tree-pose");
    expect(targetFor(pose, { goal: "stay_active", level: "beginner" }, 0)).toEqual({ sets: 1, reps: 30 });
    expect(targetFor(pose, { goal: "stay_active", level: "some_experience" }, 0)).toEqual({ sets: 1, reps: 45 });
    expect(targetFor(pose, { goal: "stay_active", level: "beginner" }, 4).reps).toBe(50);
    expect(targetFor(pose, { goal: "stay_active", level: "beginner" }, 99).reps).toBe(90);
  });

  it("yoga flows are one block of minutes, like cardio", () => {
    expect(targetFor(byId("gentle-flow"), { goal: "stay_active", level: "beginner" }, 5)).toEqual({ sets: 1, reps: byId("gentle-flow").durationMin });
  });

  it("gentle yoga has no muscle conflicts, so with 2 days each day mixes at least 3 groups", () => {
    const plan = generatePlan({ ...yoga, days: 2, minutes: 60 }, 0);
    expect(plan.days).toHaveLength(2);
    for (const d of plan.days) expect(d.groups.length).toBeGreaterThanOrEqual(3);
  });

  it("the same safety rules apply: sore knees remove knee-loading poses, sore wrists remove weight-on-hands poses", () => {
    const knee = usableFor({ ...yoga, limitations: ["knee"] }).map((e) => e.id);
    for (const id of ["chair-pose", "warrior-two", "pigeon-pose", "childs-pose"]) expect(knee).not.toContain(id);
    expect(knee).toContain("mountain-pose");
    const wrist = usableFor({ ...yoga, limitations: ["wrist"] }).map((e) => e.id);
    for (const id of ["downward-dog", "plank-pose", "cat-cow", "cobra-pose", "thread-needle", "sun-salutation"]) expect(wrist).not.toContain(id);
    expect(wrist).toContain("bridge-pose");
  });

  it("a home gym (dumbbells, bands, pull-up bar) never gets gym-only exercises, a full gym does", () => {
    const home = usableFor({ ...base, format: "gym", equipment: ["dumbbells", "resistance_band", "pull_up_bar"] });
    expect(home.some((e) => e.equipment.includes("gym"))).toBe(false);
    expect(home.some((e) => e.equipment.includes("dumbbells"))).toBe(true);
    const full = usableFor({ ...base, format: "gym", equipment: ["gym"] });
    expect(full.some((e) => e.equipment.includes("gym"))).toBe(true);
  });

  it("swapping a yoga pose gives another yoga pose for the same muscle group", () => {
    const usable = usableFor(yoga);
    const swap = chooseSwap(byId("tree-pose"), usable, ["tree-pose"], 3, 30)!;
    expect(swap).not.toBeNull();
    expect(swap.style).toBe("yoga");
    expect(swap.muscleGroup).toBe("legs");
  });
});
