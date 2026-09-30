// Body weight is always STORED in kilograms and converted only for display.
export type Unit = "kg" | "lb";

export const KG_PER_LB = 0.45359237;

const round = (x: number, places: number) => Math.round(x * 10 ** places) / 10 ** places;

/** A value the user typed (in their unit) → kilograms, rounded to 2 decimals for the database. */
export const toKg = (value: number, unit: Unit): number => round(unit === "kg" ? value : value * KG_PER_LB, 2);

/** Kilograms from the database → the user's unit, rounded to 1 decimal for the screen. */
export const fromKg = (kg: number, unit: Unit): number => round(unit === "kg" ? kg : kg / KG_PER_LB, 1);

export const formatWeight = (kg: number, unit: Unit): string => `${fromKg(kg, unit)} ${unit}`;

/** A sensible human body weight (guards against typos like 700). */
export const isPlausibleKg = (kg: number): boolean => Number.isFinite(kg) && kg >= 20 && kg <= 400;
