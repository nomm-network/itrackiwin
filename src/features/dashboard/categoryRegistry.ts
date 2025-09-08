import { lazy } from "react";

export type SubItem = {
  key: string;
  label: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
};

export type CategoryEntry = {
  key: string;           // e.g. "health.fitness"
  label: string;         // UI label
  icon?: string;         // optional icon key
  sub: SubItem[];
  defaultSubKey: string; // which sub opens first
};

export const CATEGORY_REGISTRY: CategoryEntry[] = [
  {
    key: "health.fitness",
    label: "Fitness",
    icon: "dumbbell",
    defaultSubKey: "training",
    sub: [
      { key: "training",  label: "Training Center", component: lazy(() => import("./modules/fitness/TrainingCenterView")) },
      { key: "history",   label: "Workout History",  component: lazy(() => import("./modules/fitness/WorkoutHistoryView")) },
      { key: "readiness", label: "Readiness",        component: lazy(() => import("./modules/fitness/ReadinessView")) },
    ],
  },
  {
    key: "health.nutrition",
    label: "Nutrition",
    icon: "utensils",
    defaultSubKey: "log",
    sub: [
      { key: "log",   label: "Meal Log",    component: lazy(() => import("./modules/nutrition/MealLogView")) },
      { key: "stats", label: "Macro Stats", component: lazy(() => import("./modules/nutrition/MacroStatsView")) },
    ],
  },
  {
    key: "relationships",
    label: "Relationships",
    icon: "heart",
    defaultSubKey: "friends",
    sub: [
      { key: "friends", label: "Friends", component: lazy(() => import("./modules/relationships/FriendsView")) },
      { key: "family",  label: "Family",  component: lazy(() => import("./modules/relationships/FamilyView")) },
      { key: "love",    label: "Love",    component: lazy(() => import("./modules/relationships/LoveView")) },
    ],
  },
];