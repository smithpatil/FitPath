// The three workout styles a person can choose: Gym, Strength and Yoga.
// Pure data and helpers (no React, no database) so they can be unit-tested.
import type { IconName } from "@/components/Icon";
import type { Equipment, Exercise } from "./math/types";

export type Format = "gym" | "strength" | "yoga";

export const FORMAT_ORDER: Format[] = ["gym", "strength", "yoga"];

/** What a "home gym" can contain. A commercial gym contains all of these and more. */
export const HOME_ITEMS: Equipment[] = ["dumbbells", "resistance_band", "pull_up_bar"];

export interface FormatInfo {
  title: string;
  /** Shown on the card, like "20–60 mins workout". */
  length: string;
  description: string;
  benefits: { icon: IconName; text: string }[];
  /** Goal labels shown in this style's setup (same three goals, friendlier words). */
  goals: { lose_weight: string; build_strength: string; stay_active: string };
}

export const FORMAT_INFO: Record<Format, FormatInfo> = {
  gym: {
    title: "Gym",
    length: "20–60 mins workout",
    description: "Build strength and fitness with machines, free weights and cardio, at a gym or in your own home gym.",
    benefits: [
      { icon: "dumbbell", text: "Gain muscle" },
      { icon: "flame", text: "Lose weight" },
      { icon: "bolt", text: "Increase strength" },
    ],
    goals: { build_strength: "Gain muscle and strength", lose_weight: "Lose weight", stay_active: "Stay fit and healthy" },
  },
  strength: {
    title: "Strength",
    length: "15–60 mins workout",
    description: "Get stronger anywhere with your body weight, dumbbells or bands. No gym needed.",
    benefits: [
      { icon: "bolt", text: "Build strength" },
      { icon: "target", text: "Tone up" },
      { icon: "home", text: "No gym needed" },
    ],
    goals: { build_strength: "Get stronger", lose_weight: "Tone up and lose weight", stay_active: "Move and feel better" },
  },
  yoga: {
    title: "Yoga",
    length: "15–60 mins session",
    description: "Gentle poses and slow breathing to move better, relax and feel calm. No equipment at all.",
    benefits: [
      { icon: "pulse", text: "Flexibility" },
      { icon: "smile", text: "Reduce stress" },
      { icon: "target", text: "Better balance" },
    ],
    goals: { build_strength: "Build strength gently", lose_weight: "Gentle calorie burn", stay_active: "Flexibility and calm" },
  },
};

/** Which of the two exercise libraries an exercise belongs to. */
export const isYoga = (e: Pick<Exercise, "style">): boolean => e.style === "yoga";

/** Yoga plans use only yoga poses. Gym and Strength plans use everything except yoga poses. */
export const fitsFormat = (e: Pick<Exercise, "style">, format: Format): boolean => (format === "yoga" ? isYoga(e) : !isYoga(e));

/** Profiles saved before styles existed: a gym user is "gym", everyone else "strength". */
export const deriveFormat = (equipment: Equipment[]): Format => (equipment.includes("gym") ? "gym" : "strength");

export const formatOf = (p: { format?: Format; equipment: Equipment[] }): Format => p.format ?? deriveFormat(p.equipment);

/**
 * The equipment that makes sense for a style:
 *   yoga      → none (just a mat)
 *   gym       → ["gym"] (a full gym has everything), or a home gym: any of dumbbells, bands, pull-up bar
 *   strength  → any of dumbbells, bands, pull-up bar (no gym)
 */
export function normaliseEquipment(format: Format, equipment: Equipment[]): Equipment[] {
  if (format === "yoga") return [];
  if (format === "gym" && equipment.includes("gym")) return ["gym"];
  return [...new Set(equipment.filter((e) => HOME_ITEMS.includes(e)))];
}
