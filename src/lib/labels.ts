// Friendly, plain-language names for the screens.
import type { Exercise } from "./math/types";

export const GROUP_LABEL: Record<string, string> = {
  legs: "Legs",
  glutes: "Bottom (glutes)",
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  core: "Tummy and core",
};

export const groupTitle = (groups: string[]) => groups.map((g) => GROUP_LABEL[g] ?? g).join(" + ");

/** "2 sets of 8 reps" or "2 sets of 20 seconds". */
export function describeTarget(sets: number, reps: number, unit: Exercise["unit"]): string {
  return `${sets} sets of ${reps} ${unit === "seconds" ? "seconds" : "reps"}`;
}

export const EQUIPMENT_LABEL: Record<string, string> = {
  bodyweight: "No equipment",
  dumbbells: "Dumbbells",
  resistance_band: "Resistance band",
  pull_up_bar: "Pull-up bar",
  gym: "Gym equipment",
};
