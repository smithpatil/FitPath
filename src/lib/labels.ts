// Friendly, plain-language names for the screens.
import type { Format } from "./formats";
import type { Exercise } from "./math/types";

export const GROUP_LABEL: Record<string, string> = {
  legs: "Legs",
  glutes: "Bottom (glutes)",
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  core: "Tummy and core",
  cardio: "Cardio (heart and lungs)",
};

/** The same eight groups, named the way a yoga class would. */
export const YOGA_GROUP_LABEL: Record<string, string> = {
  legs: "Legs",
  glutes: "Hips",
  chest: "Chest opening",
  back: "Spine",
  shoulders: "Shoulders",
  arms: "Arms",
  core: "Core",
  cardio: "Whole body",
};

export const groupLabel = (group: string, format?: Format): string => (format === "yoga" ? YOGA_GROUP_LABEL : GROUP_LABEL)[group] ?? group;

/** Short list of a day's focus, e.g. "Legs + Chest" (or "Hips + Spine" for yoga). */
export const groupTitle = (groups: string[], format?: Format): string => groups.map((g) => groupLabel(g, format)).join(" + ");

/** The big headline for a day: "Legs + Chest" for strength, "Flow for hips, spine and shoulders" for yoga. */
export function dayFocus(groups: string[], format?: Format): string {
  if (format !== "yoga") return groupTitle(groups, format);
  const names = groups.map((g) => groupLabel(g, "yoga").toLowerCase());
  if (names.length <= 1) return `Flow for ${names[0] ?? "your whole body"}`;
  return `Flow for ${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/** What to call the things you do: "exercises", or "poses" in yoga. */
export const itemWord = (format?: Format): string => (format === "yoga" ? "poses" : "exercises");

/** "2 sets of 8 reps", "2 sets of 20 seconds" or "10 minutes" (cardio). */
export function describeTarget(sets: number, reps: number, unit: Exercise["unit"]): string {
  if (unit === "minutes") return `${reps} minutes`;
  if (unit === "seconds" && sets === 1) return `Hold ${reps} seconds`;
  return `${sets} sets of ${reps} ${unit === "seconds" ? "seconds" : "reps"}`;
}

export const EQUIPMENT_LABEL: Record<string, string> = {
  bodyweight: "No equipment",
  dumbbells: "Dumbbells",
  resistance_band: "Resistance band",
  pull_up_bar: "Pull-up bar",
  gym: "Gym equipment",
};
