import type { FC } from "react";
import FitnessBody from "@/features/hub/bodies/health/FitnessBody";
import NutritionBody from "@/features/hub/bodies/health/NutritionBody";
import SleepBody from "@/features/hub/bodies/health/SleepBody";
import MedicalBody from "@/features/hub/bodies/health/MedicalBody";
import EnergyBody from "@/features/hub/bodies/health/EnergyBody";

// Generic "under construction" body (used by non-Health subs until you replace)
import TipsBody from "@/features/hub/bodies/common/TipsBody";

export type BodyComp = FC<{ category: string; subSlug: string }>;

const HEALTH: Record<string, BodyComp> = {
  "fitness-exercise": FitnessBody,
  "nutrition-hydration": NutritionBody,
  "sleep-quality": SleepBody,
  "medical-checkups": MedicalBody,
  "energy-levels": EnergyBody,
  // configure is now handled by configureResolver
};

const MAP: Record<string, Record<string, BodyComp>> = {
  health: HEALTH,

  // Until you build real pages for these, they point to TipsBody:
  wealth: {
    "income-career-growth": TipsBody,
    "saving-investing": TipsBody,
    "budgeting-debt": TipsBody,
    "financial-education": TipsBody,
    "wealth-building": TipsBody,
  },
  relationships: {
    "family-relationships": TipsBody,
    "romantic-life": TipsBody,
    friendships: TipsBody,
    "community-social-skills": TipsBody,
    "networking-collaboration": TipsBody,
  },
  mind: {
    "stress-management": TipsBody,
    "mindfulness-meditation": TipsBody,
    "self-awareness": TipsBody,
    "emotional-regulation": TipsBody,
    "therapy-mental-health": TipsBody,
  },
  purpose: {
    "career-purpose-or-calling": TipsBody,
    "skill-development": TipsBody,
    "hobbies-creativity": TipsBody,
    "continuous-learning": TipsBody,
    "goal-setting": TipsBody,
  },
  lifestyle: {
    "time-productivity": TipsBody,
    "environment-organization": TipsBody,
    "minimalism-sustainability": TipsBody,
    "volunteering-giving-back": TipsBody,
    "legacy-projects": TipsBody,
  },
};

export function resolveBodyByCategory(
  categorySlug: string,
  subSlug: string
): BodyComp {
  const cat = (categorySlug || "health").toLowerCase();
  const sub = (subSlug || "").toLowerCase();
  const table = MAP[cat];

  if (table && table[sub]) return table[sub];
  return TipsBody; // safe fallback — always a valid component
}