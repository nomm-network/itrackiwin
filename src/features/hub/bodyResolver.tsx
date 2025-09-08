import React from "react";
import type { FC } from "react";
import FitnessBody from "@/features/hub/bodies/health/FitnessBody";
import NutritionBody from "@/features/hub/bodies/health/NutritionBody";
import SleepBody from "@/features/hub/bodies/health/SleepBody";
import MedicalBody from "@/features/hub/bodies/health/MedicalBody";
import EnergyBody from "@/features/hub/bodies/health/EnergyBody";

// Generic "under construction" body (used by non-Health subs until you replace)
const TipsBody = React.lazy(() => import("@/features/hub/bodies/common/TipsBody"));

export type BodyComp = FC<{ category: string; subSlug: string }>;

const HEALTH: Record<string, BodyComp> = {
  "fitness-exercise": FitnessBody,
  "nutrition-hydration": NutritionBody,
  "sleep-quality": SleepBody,
  "medical-checkups": MedicalBody,
  "energy-levels": EnergyBody,
  // configure is now handled by configureResolver
};

export function resolveBodyByCategory(
  categorySlug: string,
  subSlug: string
): BodyComp {
  const cat = (categorySlug || "health").toLowerCase();
  const sub = (subSlug || "").toLowerCase();

  if (cat === "health") {
    return HEALTH[sub] ?? FitnessBody;     // OK: Health-only fallback
  }
  
  // All other categories: use Tips body (or their real bodies when you add them)
  return (props: any) => <TipsBody category={cat} subSlug={sub} {...props} />;
}