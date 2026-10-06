import { describe, expect, it } from "vitest";
import { finishesExercise, formatClock, initialState, restSeconds, workoutReducer, type WorkoutAction, type WorkoutState } from "./workoutMode";

const steps = [{ sets: 2 }, { sets: 1 }, { sets: 3 }];
const run = (start: WorkoutState, actions: WorkoutAction["type"][]) =>
  actions.reduce((s, type) => workoutReducer(steps, s, { type } as WorkoutAction), start);

describe("initialState", () => {
  it("starts at the first exercise that is not done", () => {
    expect(initialState([true, false, false])).toEqual({ index: 1, set: 1, phase: "ready" });
  });
  it("everything done means complete", () => {
    expect(initialState([true, true]).phase).toBe("complete");
  });
});

describe("workoutReducer", () => {
  const start = initialState([false, false, false]);

  it("between sets: finish set → rest → next set", () => {
    const s1 = run(start, ["finishSet"]);
    expect(s1).toEqual({ index: 0, set: 2, phase: "resting" });
    expect(run(s1, ["restOver"])).toEqual({ index: 0, set: 2, phase: "ready" });
  });
  it("after the last set it rests, then moves to the next exercise", () => {
    expect(run(start, ["finishSet", "restOver", "finishSet"])).toEqual({ index: 1, set: 1, phase: "resting" });
  });
  it("the whole workout ends in 'complete'", () => {
    const all: WorkoutAction["type"][] = [
      "finishSet", "restOver", "finishSet", "restOver", // exercise 1: 2 sets
      "finishSet", "restOver", // exercise 2: 1 set
      "finishSet", "restOver", "finishSet", "restOver", "finishSet", // exercise 3: 3 sets
    ];
    expect(run(start, all).phase).toBe("complete");
  });
  it("timed exercises: start hold → finish → rest", () => {
    const held = run(start, ["startHold"]);
    expect(held.phase).toBe("holding");
    expect(run(held, ["finishSet"])).toEqual({ index: 0, set: 2, phase: "resting" });
  });
  it("ignores actions that make no sense in the current phase", () => {
    const resting = run(start, ["finishSet"]);
    expect(run(resting, ["finishSet"])).toEqual(resting); // can't finish a set while resting
    expect(run(start, ["restOver"])).toEqual(start); // can't end a rest that hasn't started
    expect(run(resting, ["startHold"])).toEqual(resting);
  });
  it("next / prev jump between exercises and reset the set counter", () => {
    expect(run(start, ["finishSet", "next"])).toEqual({ index: 1, set: 1, phase: "ready" });
    expect(run(start, ["next", "next", "prev"])).toEqual({ index: 1, set: 1, phase: "ready" });
    expect(run(start, ["prev"])).toEqual({ index: 0, set: 1, phase: "ready" }); // can't go before the first
    expect(run(start, ["next", "next", "next"]).phase).toBe("complete");
  });
});

describe("finishesExercise", () => {
  it("is true only on the last set of an exercise", () => {
    const start = initialState([false, false, false]);
    expect(finishesExercise(start, steps)).toBe(false); // set 1 of 2
    const onSet2 = run(start, ["finishSet", "restOver"]);
    expect(finishesExercise(onSet2, steps)).toBe(true); // set 2 of 2
    expect(finishesExercise(run(start, ["finishSet"]), steps)).toBe(false); // resting
  });
});

describe("helpers", () => {
  it("rest time depends on experience", () => {
    expect(restSeconds("beginner")).toBe(60);
    expect(restSeconds("some_experience")).toBe(90);
  });
  it("formats the clock", () => {
    expect(formatClock(75)).toBe("1:15");
    expect(formatClock(5)).toBe("0:05");
    expect(formatClock(-3)).toBe("0:00");
  });
});
