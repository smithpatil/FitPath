// Shared types for the maths library. Plain data only: no database or UI code.

export type MuscleGroup = "legs" | "glutes" | "chest" | "back" | "shoulders" | "arms" | "core";

export type Equipment = "bodyweight" | "dumbbells" | "resistance_band" | "pull_up_bar" | "gym";

/** Everything a person can use if they have access to a full gym. */
export const ALL_EQUIPMENT: Equipment[] = ["bodyweight", "dumbbells", "resistance_band", "pull_up_bar", "gym"];

export type Limitation = "knee" | "lower_back" | "shoulder" | "wrist";

export type Level = "beginner" | "some_experience";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  /** Equipment REQUIRED to do it (a set; "bodyweight" means nothing needed). */
  equipment: Equipment[];
  /** 1 = easiest, 3 = hardest. */
  difficulty: 1 | 2 | 3;
  /** Whole minutes for one exercise block (all sets, including rests). */
  durationMin: number;
  /** Training value, 1 to 10. Used as the "value" in the knapsack. */
  benefit: number;
  impact: "low" | "high";
  /** Safety tags, e.g. "knee_load". Used by the logic rules. */
  tags: SafetyTag[];
  /** "reps" = how many times you repeat the movement, "seconds" = how long you hold it. */
  unit: "reps" | "seconds";
  /** Ids of the slightly easier exercises this one builds on (progression). */
  easierIds: string[];
  howTo: string;
}

export type SafetyTag = "knee_load" | "spine_load" | "overhead" | "wrist_load";

export interface UserProfile {
  level: Level;
  equipment: Equipment[];
  limitations: Limitation[];
}

/** A directed edge [easier, harder] in the progression graph. */
export type Edge = [string, string];
