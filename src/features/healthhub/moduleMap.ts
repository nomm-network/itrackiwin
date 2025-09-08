import React, { lazy } from "react";

// Common fallback
const UnderConstruction = lazy(() => import("./modules/common/UnderConstruction"));

// Health modules (real/working)
const FitnessTrainingView = lazy(() => import("./modules/fitness/FitnessTrainingView"));

// Health modules (placeholders)
const MealLogView = lazy(() => import("./modules/nutrition/MealLogView"));
const MacroStatsView = lazy(() => import("./modules/nutrition/MacroStatsView"));
const RecipesView = lazy(() => import("./modules/nutrition/RecipesView"));
const SleepOverview = lazy(() => import("./modules/sleep/SleepOverviewView"));
const SleepLog = lazy(() => import("./modules/sleep/SleepLogView"));
const MedicalOverview = lazy(() => import("./modules/medical/MedicalOverviewView"));
const EnergyOverview = lazy(() => import("./modules/energy/EnergyOverviewView"));
const ConfigureView = lazy(() => import("./modules/configure/ConfigureView"));

// Relationships modules (placeholders)
const FriendsView = lazy(() => import("./modules/relationships/FriendsView"));
const FamilyView = lazy(() => import("./modules/relationships/FamilyView"));
const LoveView = lazy(() => import("./modules/relationships/LoveView"));

// Wealth modules (placeholders)
const FinanceView = lazy(() => import("./modules/wealth/FinanceView"));
const CareerView = lazy(() => import("./modules/wealth/CareerView"));
const InvestmentsView = lazy(() => import("./modules/wealth/InvestmentsView"));

// Personal Growth modules (placeholders)  
const SkillsView = lazy(() => import("./modules/growth/SkillsView"));
const KnowledgeView = lazy(() => import("./modules/growth/KnowledgeView"));
const GoalsView = lazy(() => import("./modules/growth/GoalsView"));

// Lifestyle modules (placeholders)
const HabitsView = lazy(() => import("./modules/lifestyle/HabitsView"));
const ProductivityView = lazy(() => import("./modules/lifestyle/ProductivityView"));
const MindfulnessView = lazy(() => import("./modules/lifestyle/MindfulnessView"));

/**
 * Map category/subcategory combinations to components.
 * Format: "{categorySlug}.{subcategorySlug}" -> Component
 * 
 * Database slugs will determine which component gets rendered.
 * If no mapping exists, falls back to UnderConstruction.
 */
export const MODULE_MAP: Record<string, React.ComponentType<any>> = {
  // Health modules
  "health.fitness": FitnessTrainingView,
  "health.nutrition": MealLogView,
  "health.sleep": SleepOverview,
  "health.medical": MedicalOverview,
  "health.energy": EnergyOverview,
  "health.configure": ConfigureView,
  
  // Specific health sub-modules
  "health.nutrition.meal_log": MealLogView,
  "health.nutrition.macro_stats": MacroStatsView,
  "health.nutrition.recipes": RecipesView,
  "health.sleep.overview": SleepOverview,
  "health.sleep.log": SleepLog,

  // Relationships modules
  "relationships.friends": FriendsView,
  "relationships.family": FamilyView,
  "relationships.love": LoveView,

  // Wealth modules
  "wealth.finance": FinanceView,
  "wealth.career": CareerView,
  "wealth.investments": InvestmentsView,

  // Personal Growth modules
  "mind.skills": SkillsView,
  "mind.knowledge": KnowledgeView,
  "mind.goals": GoalsView,

  // Lifestyle modules
  "lifestyle.habits": HabitsView,
  "lifestyle.productivity": ProductivityView,
  "lifestyle.mindfulness": MindfulnessView,
};

/**
 * Resolve which component to render for a given category/subcategory.
 * Falls back to UnderConstruction with contextual messaging.
 */
export function resolveView(categorySlug: string, subcategorySlug?: string): React.ComponentType<any> {
  // Try full key first (category.subcategory)
  if (subcategorySlug) {
    const fullKey = `${categorySlug}.${subcategorySlug}`;
    if (MODULE_MAP[fullKey]) {
      return MODULE_MAP[fullKey];
    }
  }

  // Try category-level key
  if (MODULE_MAP[categorySlug]) {
    return MODULE_MAP[categorySlug];
  }

  // Fallback to under construction
  return function UnderConstructionFallback() {
    return React.createElement(UnderConstruction, {
      categorySlug: categorySlug,
      subcategorySlug: subcategorySlug
    });
  };
}

/**
 * Get default subcategory for a category (first available module or fallback)
 */
export function getDefaultSubcategory(categorySlug: string, availableSubcategories: string[]): string {
  // Look for the first subcategory that has a module defined
  for (const subSlug of availableSubcategories) {
    const fullKey = `${categorySlug}.${subSlug}`;
    if (MODULE_MAP[fullKey]) {
      return subSlug;
    }
  }
  
  // If category itself has a module, return empty string (category-level view)
  if (MODULE_MAP[categorySlug]) {
    return "";
  }

  // Return first available subcategory as fallback
  return availableSubcategories[0] || "";
}