import React from "react";

// ✅ Fitness uses the frozen legacy layout:
import FitnessBody from "@/features/hub/bodies/fitness-body";

// Placeholder bodies for now—simple "Under construction" with 10 tips.
// (Put small components in these files; do NOT touch Fitness.)
const NutritionBody  = React.lazy(() => import("@/features/hub/bodies/nutrition-body"));
const SleepBody      = React.lazy(() => import("@/features/hub/bodies/sleep-body"));
const MedicalBody    = React.lazy(() => import("@/features/hub/bodies/medical-body"));
const EnergyBody     = React.lazy(() => import("@/features/hub/bodies/energy-body"));
const ConfigureBody  = React.lazy(() => import("@/features/hub/bodies/configure-body"));

const HEALTH_SUB_BODIES: Record<string, React.ComponentType> = {
  "fitness-exercise": FitnessBody,     // 🔒 legacy look preserved
  "nutrition-hydration": NutritionBody,
  "sleep-quality": SleepBody,
  "medical-checkups": MedicalBody,
  "energy-levels": EnergyBody,
  "configure": ConfigureBody,
};

export function resolveHealthBody(subSlug: string) {
  const key = (subSlug || "").toLowerCase();
  return HEALTH_SUB_BODIES[key] ?? FitnessBody;
}