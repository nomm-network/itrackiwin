import React from "react";

// legacy Fitness body (verbatim UI)
const FitnessLegacyBody = React.lazy(() => import("@/features/health/fitness/legacy/FitnessLegacyBody"));

// simple placeholders for now (do NOT affect Fitness visuals)
const NutritionBody  = React.lazy(() => import("@/features/hub/bodies/NutritionBody"));
const SleepBody      = React.lazy(() => import("@/features/hub/bodies/SleepBody"));
const MedicalBody    = React.lazy(() => import("@/features/hub/bodies/MedicalBody"));
const EnergyBody     = React.lazy(() => import("@/features/hub/bodies/EnergyBody"));
const ConfigureBody  = React.lazy(() => import("@/features/hub/bodies/ConfigureBody"));

const MAP: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  "fitness-exercise":    FitnessLegacyBody,  // 🔒 freeze old look
  "nutrition-hydration": NutritionBody,
  "sleep-quality":       SleepBody,
  "medical-checkups":    MedicalBody,
  "energy-levels":       EnergyBody,
  "configure":           ConfigureBody,
};

export function resolveBody(sub: string) {
  const key = (sub || "").toLowerCase();
  return MAP[key] ?? FitnessLegacyBody;
}