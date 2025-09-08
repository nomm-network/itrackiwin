import React, { lazy } from "react";

// Fitness placeholder components
const FitnessTrainingView = lazy(() => import("./modules/fitness/FitnessTrainingView"));

// Non-fitness placeholders
const MealLogView = lazy(() => import("./modules/nutrition/MealLogView"));
const MacroStatsView = lazy(() => import("./modules/nutrition/MacroStatsView"));
const RecipesView = lazy(() => import("./modules/nutrition/RecipesView"));
const SleepOverview = lazy(() => import("./modules/sleep/SleepOverviewView"));
const SleepLog = lazy(() => import("./modules/sleep/SleepLogView"));
const MedicalOverview = lazy(() => import("./modules/medical/MedicalOverviewView"));
const EnergyOverview = lazy(() => import("./modules/energy/EnergyOverviewView"));
const ConfigureView = lazy(() => import("./modules/configure/ConfigureView"));

export type SubDef = {
  key: string;
  label: string;
  View: React.LazyExoticComponent<React.ComponentType<any>>;
};

export type CategoryDef = {
  key: string;
  label: string;
  icon?: string;
  defaultSub: string;
  subs: SubDef[];
  Header: React.ComponentType;
  KPIs: React.ComponentType;
  Quick: React.ComponentType;
};

// Shared placeholder components
const PlaceholderHeader = ({ title }: { title: string }) => {
  return React.createElement('h1', { className: 'text-2xl sm:text-3xl font-bold' }, title + ' Hub');
};

const PlaceholderKPIs = ({ kpis }: { kpis: Array<{ label: string; value: string }> }) => {
  return React.createElement('div', 
    { className: 'grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4' },
    kpis.map((kpi, index) => 
      React.createElement('div', 
        { key: index, className: 'bg-card p-3 rounded-lg border' },
        React.createElement('div', { className: 'text-sm text-muted-foreground' }, kpi.label),
        React.createElement('div', { className: 'text-lg font-semibold' }, kpi.value)
      )
    )
  );
};

const PlaceholderQuick = () => {
  return React.createElement('div', 
    { className: 'bg-card p-3 rounded-lg border' },
    React.createElement('div', { className: 'text-sm text-muted-foreground' }, 'Quick Actions coming soon...')
  );
};

export const CATEGORIES: CategoryDef[] = [
  {
    key: "health.fitness",
    label: "Fitness",
    defaultSub: "training",
    subs: [
      { key: "training", label: "Training Center", View: FitnessTrainingView },
    ],
    Header: () => PlaceholderHeader({ title: "Fitness" }),
    KPIs: () => PlaceholderKPIs({ kpis: [
      { label: "Workouts (7d)", value: "5/7" },
      { label: "Calories Burned", value: "2,840" },
      { label: "Personal Records", value: "3 this month" },
      { label: "Streak", value: "12 days" }
    ]}),
    Quick: PlaceholderQuick,
  },
  {
    key: "health.nutrition",
    label: "Nutrition",
    defaultSub: "meal_log",
    subs: [
      { key: "meal_log", label: "Meal Log", View: MealLogView },
      { key: "macro_stats", label: "Macro Stats", View: MacroStatsView },
      { key: "recipes", label: "Recipes", View: RecipesView },
    ],
    Header: () => PlaceholderHeader({ title: "Nutrition" }),
    KPIs: () => PlaceholderKPIs({ kpis: [
      { label: "Avg Protein/day", value: "125g" },
      { label: "Fiber/day", value: "28g" },
      { label: "Water Intake", value: "2.1L" },
      { label: "Meals Logged (7d)", value: "18/21" }
    ]}),
    Quick: PlaceholderQuick,
  },
  {
    key: "health.sleep",
    label: "Sleep",
    defaultSub: "overview",
    subs: [
      { key: "overview", label: "Overview", View: SleepOverview },
      { key: "log", label: "Sleep Log", View: SleepLog },
    ],
    Header: () => PlaceholderHeader({ title: "Sleep" }),
    KPIs: () => PlaceholderKPIs({ kpis: [
      { label: "Avg Sleep (7d)", value: "7h 32m" },
      { label: "Consistency", value: "85%" },
      { label: "Quality", value: "Good" },
      { label: "Caffeine Cutoff", value: "2:30 PM" }
    ]}),
    Quick: PlaceholderQuick,
  },
  {
    key: "health.medical",
    label: "Medical",
    defaultSub: "overview",
    subs: [
      { key: "overview", label: "Overview", View: MedicalOverview },
    ],
    Header: () => PlaceholderHeader({ title: "Medical" }),
    KPIs: () => PlaceholderKPIs({ kpis: [
      { label: "Next Checkup", value: "In 2 months" },
      { label: "Medications", value: "3 active" },
      { label: "Last Blood Work", value: "3 months ago" },
      { label: "Health Score", value: "8.2/10" }
    ]}),
    Quick: PlaceholderQuick,
  },
  {
    key: "health.energy",
    label: "Energy",
    defaultSub: "overview",
    subs: [
      { key: "overview", label: "Overview", View: EnergyOverview },
    ],
    Header: () => PlaceholderHeader({ title: "Energy" }),
    KPIs: () => PlaceholderKPIs({ kpis: [
      { label: "Energy Level", value: "7.5/10" },
      { label: "Focus Time", value: "4h 20m" },
      { label: "Mood", value: "Good" },
      { label: "Stress Level", value: "Low" }
    ]}),
    Quick: PlaceholderQuick,
  },
  {
    key: "health.configure",
    label: "Configure",
    defaultSub: "settings",
    subs: [
      { key: "settings", label: "Settings", View: ConfigureView },
    ],
    Header: () => PlaceholderHeader({ title: "Configure" }),
    KPIs: () => PlaceholderKPIs({ kpis: [
      { label: "Profile Complete", value: "85%" },
      { label: "Goals Set", value: "12/15" },
      { label: "Integrations", value: "3 active" },
      { label: "Backup Status", value: "Up to date" }
    ]}),
    Quick: PlaceholderQuick,
  },
];

export function findCategory(catKey?: string) {
  const defaultCat = CATEGORIES[0];
  if (!catKey) return defaultCat;
  return CATEGORIES.find(c => c.key === catKey) ?? defaultCat;
}