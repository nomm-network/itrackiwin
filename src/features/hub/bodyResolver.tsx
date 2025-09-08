import React from "react";

// HEALTH
import FitnessBody from "./bodies/health/FitnessBody";
const NutritionBody  = React.lazy(() => import("./bodies/health/NutritionBody"));
const SleepBody      = React.lazy(() => import("./bodies/health/SleepBody"));
const MedicalBody    = React.lazy(() => import("./bodies/health/MedicalBody"));
const EnergyBody     = React.lazy(() => import("./bodies/health/EnergyBody"));
const ConfigureBody  = React.lazy(() => import("./bodies/health/ConfigureBody"));

// RELATIONSHIPS
const FamilyBody     = React.lazy(() => import("./bodies/relationships/FamilyRelationshipsBody"));
const RomanticBody   = React.lazy(() => import("./bodies/relationships/RomanticLifeBody"));
const FriendsBody    = React.lazy(() => import("./bodies/relationships/FriendshipsBody"));
const CommunityBody  = React.lazy(() => import("./bodies/relationships/CommunitySocialSkillsBody"));
const NetworkBody    = React.lazy(() => import("./bodies/relationships/NetworkingCollaborationBody"));

// WEALTH
const IncomeBody     = React.lazy(() => import("./bodies/wealth/IncomeCareerGrowthBody"));
const SavingBody     = React.lazy(() => import("./bodies/wealth/SavingInvestingBody"));
const BudgetBody     = React.lazy(() => import("./bodies/wealth/BudgetingDebtBody"));
const FinEdBody      = React.lazy(() => import("./bodies/wealth/FinancialEducationBody"));
const WealthBuildBody= React.lazy(() => import("./bodies/wealth/WealthBuildingBody"));

// MIND
const StressBody     = React.lazy(() => import("./bodies/mind/StressManagementBody"));
const MindfulnessBody= React.lazy(() => import("./bodies/mind/MindfulnessMeditationBody"));
const AwarenessBody  = React.lazy(() => import("./bodies/mind/SelfAwarenessBody"));
const EmoRegBody     = React.lazy(() => import("./bodies/mind/EmotionalRegulationBody"));
const TherapyBody    = React.lazy(() => import("./bodies/mind/TherapyMentalHealthBody"));

// PURPOSE
const PurposeBody    = React.lazy(() => import("./bodies/purpose/CareerPurposeOrCallingBody"));
const SkillBody      = React.lazy(() => import("./bodies/purpose/SkillDevelopmentBody"));
const HobbiesBody    = React.lazy(() => import("./bodies/purpose/HobbiesCreativityBody"));
const LearningBody   = React.lazy(() => import("./bodies/purpose/ContinuousLearningBody"));
const GoalsBody      = React.lazy(() => import("./bodies/purpose/GoalSettingBody"));

// LIFESTYLE
const TimeBody       = React.lazy(() => import("./bodies/lifestyle/TimeProductivityBody"));
const EnvBody        = React.lazy(() => import("./bodies/lifestyle/EnvironmentOrganizationBody"));
const MinimalBody    = React.lazy(() => import("./bodies/lifestyle/MinimalismSustainabilityBody"));
const VolunteerBody  = React.lazy(() => import("./bodies/lifestyle/VolunteeringGivingBackBody"));
const LegacyBody     = React.lazy(() => import("./bodies/lifestyle/LegacyProjectsBody"));

// Generic tips body for other categories
const TipsBody = React.lazy(() => import("./TipsBody"));

const HEALTH: Record<string, React.ComponentType> = {
  "fitness-exercise": FitnessBody, // 🔒 frozen legacy UI
  "nutrition-hydration": NutritionBody,
  "sleep-quality": SleepBody,
  "medical-checkups": MedicalBody,
  "energy-levels": EnergyBody,
  "configure": ConfigureBody,
};

// For categories other than health we render the generated tips body.
// We create a wrapper component that passes the subcategory slug to TipsBody
export function resolveBodyByCategory(cat: string, sub: string): React.ComponentType {
  if (cat === "health") {
    return HEALTH[sub] ?? FitnessBody;
  }
  
  // Return a proper wrapper component that passes the subcategory slug to TipsBody
  const TipsBodyWrapper = () => <TipsBody slug={sub} />;
  return TipsBodyWrapper;
}

export function resolveBody(subSlug: string) {
  const s = (subSlug || "").toLowerCase();

  // Health
  if (s === "fitness-exercise") return FitnessBody;          // 🔒 frozen legacy
  if (s === "nutrition-hydration") return NutritionBody;
  if (s === "sleep-quality") return SleepBody;
  if (s === "medical-checkups") return MedicalBody;
  if (s === "energy-levels") return EnergyBody;
  if (s === "configure") return ConfigureBody;

  // Relationships
  if (s === "family-relationships") return FamilyBody;
  if (s === "romantic-life") return RomanticBody;
  if (s === "friendships") return FriendsBody;
  if (s === "community-social-skills") return CommunityBody;
  if (s === "networking-collaboration") return NetworkBody;

  // Wealth
  if (s === "income-career-growth") return IncomeBody;
  if (s === "saving-investing") return SavingBody;
  if (s === "budgeting-debt") return BudgetBody;
  if (s === "financial-education") return FinEdBody;
  if (s === "wealth-building") return WealthBuildBody;

  // Mind & Emotions
  if (s === "stress-management") return StressBody;
  if (s === "mindfulness-meditation") return MindfulnessBody;
  if (s === "self-awareness") return AwarenessBody;
  if (s === "emotional-regulation") return EmoRegBody;
  if (s === "therapy-mental-health") return TherapyBody;

  // Purpose & Growth
  if (s === "career-purpose-or-calling") return PurposeBody;
  if (s === "skill-development") return SkillBody;
  if (s === "hobbies-creativity") return HobbiesBody;
  if (s === "continuous-learning") return LearningBody;
  if (s === "goal-setting") return GoalsBody;

  // Lifestyle
  if (s === "time-productivity") return TimeBody;
  if (s === "environment-organization") return EnvBody;
  if (s === "minimalism-sustainability") return MinimalBody;
  if (s === "volunteering-giving-back") return VolunteerBody;
  if (s === "legacy-projects") return LegacyBody;

  // Default (safe fallback)
  return FitnessBody;
}