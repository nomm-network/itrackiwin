import React from "react";
import type { FC } from "react";

// Generic "under construction" body (used by non-Health subs until you replace)
const TipsBody = React.lazy(() => import("@/features/hub/bodies/common/TipsBody"));

export type BodyComp = FC<{ category: string; subSlug: string }>;

const HEALTH: Record<string, BodyComp> = {
  // Health components removed - using fallback
};

export function resolveBodyByCategory(
  categorySlug: string,
  subSlug: string
): BodyComp {
  const cat = (categorySlug || "health").toLowerCase();
  const sub = (subSlug || "").toLowerCase();

  // Health category uses TipsBody fallback
  if (cat === "health") {
    const title = `Health · ${sub}`;
    return (props: any) => <TipsBody category={title} subSlug={sub} {...props} />;
  }

  // All other categories use TipsBody with category-specific titles
  const categoryTitles: Record<string, Record<string, string>> = {
    wealth: {
      "income-career-growth": "Wealth · Income & Career",
      "saving-investing": "Wealth · Saving & Investing", 
      "budgeting-debt": "Wealth · Budgeting & Debt",
      "financial-education": "Wealth · Financial Education",
      "wealth-building": "Wealth · Building"
    },
    relationships: {
      "family-relationships": "Relationships · Family",
      "romantic-life": "Relationships · Romantic Life",
      "friendships": "Relationships · Friendships", 
      "community-social-skills": "Relationships · Community",
      "networking-collaboration": "Relationships · Networking"
    },
    mind: {
      "stress-management": "Mind · Stress Management",
      "mindfulness-meditation": "Mind · Mindfulness",
      "self-awareness": "Mind · Self-Awareness",
      "emotional-regulation": "Mind · Emotional Regulation", 
      "therapy-mental-health": "Mind · Mental Health"
    },
    purpose: {
      "career-purpose-or-calling": "Purpose · Career & Purpose",
      "skill-development": "Purpose · Skill Development",
      "hobbies-creativity": "Purpose · Hobbies & Creativity",
      "continuous-learning": "Purpose · Continuous Learning",
      "goal-setting": "Purpose · Goal Setting"
    },
    lifestyle: {
      "time-productivity": "Lifestyle · Time & Productivity",
      "environment-organization": "Lifestyle · Environment & Organization",
      "minimalism-sustainability": "Lifestyle · Minimalism & Sustainability", 
      "volunteering-giving-back": "Lifestyle · Volunteering & Giving",
      "legacy-projects": "Lifestyle · Legacy Projects"
    }
  };

  const title = categoryTitles[cat]?.[sub] || `${cat} · ${sub}`;
  
  return (props: any) => <TipsBody category={title} subSlug={sub} {...props} />;
}