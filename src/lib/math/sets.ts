// 1. SET THEORY
//
// A set is a collection of distinct things. We use three basic operations:
//   A ∩ B  (intersection)  = things in BOTH A and B
//   A ∪ B  (union)         = things in A OR B (or both)
//   A − B  (difference)    = things in A that are NOT in B
//
// Which exercises can this user do?
//   For an exercise with required equipment R and a user who owns U:
//     the exercise is doable  ⟺  U ∩ R = R   (i.e. R ⊆ U: they own everything it needs)
//   usable exercises = doable exercises − injury-excluded exercises

import { ALL_EQUIPMENT, type Equipment, type Exercise } from "./types";

export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set([...a].filter((x) => b.has(x)));

export const union = <T>(a: Set<T>, b: Set<T>): Set<T> => new Set([...a, ...b]);

export const difference = <T>(a: Set<T>, b: Set<T>): Set<T> =>
  new Set([...a].filter((x) => !b.has(x)));

/** A ⊆ B: every element of A is also in B. */
export const isSubset = <T>(a: Set<T>, b: Set<T>): boolean => [...a].every((x) => b.has(x));

/**
 * The user's equipment set U.
 * Everyone can do bodyweight exercises, so "bodyweight" is always in U.
 * A full gym contains every other kind of equipment too, so "gym" makes U the whole universe.
 */
export function userEquipmentSet(owned: Equipment[]): Set<Equipment> {
  if (owned.includes("gym")) return new Set<Equipment>(ALL_EQUIPMENT);
  return new Set<Equipment>([...owned, "bodyweight"]);
}

/** Exercises whose whole required-equipment set is covered by what the user owns. */
export function doableExercises(all: Exercise[], owned: Equipment[]): Exercise[] {
  const U = userEquipmentSet(owned);
  return all.filter((e) => {
    const R = new Set(e.equipment);
    return intersection(U, R).size === R.size; // U ∩ R = R
  });
}

/** usable = (user equipment ∩ requirements) − excluded ids. */
export function usableExercises(
  all: Exercise[],
  owned: Equipment[],
  excludedIds: Set<string>,
): Exercise[] {
  const doableIds = new Set(doableExercises(all, owned).map((e) => e.id));
  const usableIds = difference(doableIds, excludedIds);
  return all.filter((e) => usableIds.has(e.id));
}
