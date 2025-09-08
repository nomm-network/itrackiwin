import FitnessBody from "./bodies/fitness-body";
import NutritionBody from "./bodies/nutrition-body";
import SleepBody from "./bodies/sleep-body";
import MedicalBody from "./bodies/medical-body";
import EnergyBody from "./bodies/energy-body";
import ConfigureBody from "./bodies/configure-body";

/** Health hub resolver — maps your real slugs to bodies */
export function resolveHealthBody(subSlug: string) {
  switch (subSlug) {
    case "fitness-exercise":    return FitnessBody;
    case "nutrition-hydration": return NutritionBody;
    case "sleep-quality":       return SleepBody;
    case "medical-checkups":    return MedicalBody;
    case "energy-levels":       return EnergyBody;
    case "configure":           return ConfigureBody;
    default:                    return FitnessBody;
  }
}

export function resolveBody(_hubSlug: string, subSlug: string) {
  // For now, everything goes to Health resolver
  return resolveHealthBody(subSlug);
}