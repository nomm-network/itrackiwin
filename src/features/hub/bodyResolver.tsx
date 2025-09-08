import FitnessBodyStable from "./bodies/fitness-body";

export function resolveBody(_hubSlug: string, _subSlug: string) {
  // Phase 1: lock to Fitness body regardless of sub (to preserve look)
  return FitnessBodyStable;

  // Phase 2 (example):
  // switch (subSlug) {
  //   case "fitness": return FitnessBodyStable;
  //   case "nutrition": return NutritionBody;
  //   case "sleep": return SleepBody;
  //   ...
  //   case "configure": return ConfigureBody;
  //   default: return FitnessBodyStable;
  // }
}