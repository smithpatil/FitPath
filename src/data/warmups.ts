// Short warm-up and cool-down moves. They are not part of the knapsack: every workout day
// reserves a fixed 3 minutes for the warm-up and 2 minutes for the cool-down, and the same
// safety rules (logic.ts) remove anything unsuitable, e.g. jumping for sore knees.
import type { SafetyTag } from "../lib/math/types";

export interface RoutineMove {
  id: string;
  name: string;
  seconds: number;
  impact: "low" | "high";
  tags: SafetyTag[];
  howTo: string;
}

export const WARMUP_SECONDS = 180;
export const COOLDOWN_SECONDS = 120;

// In order of preference: the routine takes moves from the top until the time is filled.
export const WARMUP_MOVES: RoutineMove[] = [
  { id: "wu-march", name: "March on the spot", seconds: 60, impact: "low", tags: [], howTo: "Lift your knees gently and swing your arms." },
  { id: "wu-jacks", name: "Gentle jumping jacks", seconds: 30, impact: "high", tags: ["knee_load"], howTo: "Jump your feet out and in while your arms go up and down." },
  { id: "wu-arm-circles", name: "Arm circles", seconds: 30, impact: "low", tags: [], howTo: "Small circles forwards, then backwards, getting slowly bigger." },
  { id: "wu-hip-circles", name: "Hip circles", seconds: 30, impact: "low", tags: [], howTo: "Hands on hips, draw slow circles with your hips both ways." },
  { id: "wu-leg-swings", name: "Leg swings", seconds: 30, impact: "low", tags: [], howTo: "Hold a wall and gently swing one leg forwards and back, then switch." },
  { id: "wu-step-jacks", name: "Step jacks (no jumping)", seconds: 30, impact: "low", tags: [], howTo: "Step one foot out to the side as your arms rise, then back. Swap sides." },
  { id: "wu-torso-twists", name: "Torso twists", seconds: 30, impact: "low", tags: [], howTo: "Feet apart, turn your upper body slowly left and right." },
  { id: "wu-bodyweight-squats", name: "Half squats", seconds: 30, impact: "low", tags: ["knee_load"], howTo: "Bend your knees a little as if starting to sit, then stand." },
  { id: "wu-shoulder-rolls", name: "Shoulder rolls", seconds: 30, impact: "low", tags: [], howTo: "Roll your shoulders up, back and down, slowly." },
];

export const COOLDOWN_MOVES: RoutineMove[] = [
  { id: "cd-breathing", name: "Slow breathing", seconds: 30, impact: "low", tags: [], howTo: "Stand or sit tall. Breathe in for 4 counts and out for 6." },
  { id: "cd-hamstring", name: "Hamstring stretch", seconds: 30, impact: "low", tags: [], howTo: "Put one heel forward, toes up, and lean forward gently from the hips. Switch legs halfway." },
  { id: "cd-quad", name: "Standing thigh stretch", seconds: 30, impact: "low", tags: ["knee_load"], howTo: "Hold a wall, bend one knee and hold your foot behind you. Switch halfway." },
  { id: "cd-chest", name: "Chest stretch", seconds: 30, impact: "low", tags: [], howTo: "Clasp your hands behind your back and open your chest gently." },
  { id: "cd-cross-arm", name: "Cross-body shoulder stretch", seconds: 30, impact: "low", tags: [], howTo: "Bring one arm across your chest and hold it with the other. Switch halfway." },
  { id: "cd-calf", name: "Calf stretch", seconds: 30, impact: "low", tags: [], howTo: "Hands on a wall, one leg back with the heel down. Switch halfway." },
  { id: "cd-side-bend", name: "Side bend", seconds: 30, impact: "low", tags: [], howTo: "Reach one arm over your head and lean gently to the side. Switch halfway." },
];
