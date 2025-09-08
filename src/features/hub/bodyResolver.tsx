// ✅ No lazy here to avoid masking import errors while debugging.
import FitnessBody from "./bodies/fitness-body";
import NutritionBody from "./bodies/nutrition-body";
import SleepBody from "./bodies/sleep-body";
import MedicalBody from "./bodies/medical-body";
import EnergyBody from "./bodies/energy-body";
import ConfigureBody from "./bodies/configure-body";

/** Exact slugs from your DB */
export const HEALTH_SUB_BODIES: Record<string, React.ComponentType<any>> = {
  "fitness-exercise": FitnessBody,
  "nutrition-hydration": NutritionBody,
  "sleep-quality": SleepBody,
  "medical-checkups": MedicalBody,
  "energy-levels": EnergyBody,
  "configure": ConfigureBody,
};

export function resolveHealthBody(subSlug: string) {
  const key = (subSlug || "").toLowerCase();
  const Comp = HEALTH_SUB_BODIES[key] ?? FitnessBody;
  if (process.env.NODE_ENV !== "production") {
    console.debug("[resolver] sub =", subSlug, "→", Comp.name);
  }
  return Comp;
}

export function resolveBody(_hubSlug: string, subSlug: string) {
  // For now, everything goes to Health resolver
  return resolveHealthBody(subSlug);
}