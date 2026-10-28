import { describe, expect, it } from "vitest";
import { dayFocus, describeTarget, groupLabel, groupTitle, itemWord } from "./labels";

describe("wording per workout style", () => {
  it("strength and gym keep muscle-group names", () => {
    expect(groupTitle(["shoulders", "back", "arms"])).toBe("Shoulders + Back + Arms");
    expect(dayFocus(["legs", "chest"], "gym")).toBe("Legs + Chest");
    expect(itemWord("gym")).toBe("exercises");
  });

  it("yoga uses yoga words for the same groups", () => {
    expect(groupLabel("back", "yoga")).toBe("Spine");
    expect(groupLabel("glutes", "yoga")).toBe("Hips");
    expect(groupLabel("back")).toBe("Back");
    expect(groupTitle(["glutes", "back"], "yoga")).toBe("Hips + Spine");
    expect(itemWord("yoga")).toBe("poses");
  });

  it("yoga headlines read like a class: 'Flow for …'", () => {
    expect(dayFocus(["shoulders", "back", "arms"], "yoga")).toBe("Flow for shoulders, spine and arms");
    expect(dayFocus(["glutes", "core"], "yoga")).toBe("Flow for hips and core");
    expect(dayFocus(["legs"], "yoga")).toBe("Flow for legs");
    expect(dayFocus([], "yoga")).toBe("Flow for your whole body");
  });

  it("a flow day with the whole-body group still reads naturally", () => {
    expect(dayFocus(["glutes", "back", "cardio"], "yoga")).toBe("Flow for hips, spine and whole body");
  });

  it("a single held pose reads 'Hold 30 seconds'; strength still reads sets and reps", () => {
    expect(describeTarget(1, 30, "seconds")).toBe("Hold 30 seconds");
    expect(describeTarget(2, 20, "seconds")).toBe("2 sets of 20 seconds");
    expect(describeTarget(3, 10, "reps")).toBe("3 sets of 10 reps");
  });
});
