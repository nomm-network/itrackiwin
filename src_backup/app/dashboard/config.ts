import { CategoryConfig } from "./types";
import { normalizeCategoriesSubcategories } from "@/lib/dashboardUtils";

const rawCategories: CategoryConfig[] = [
  {
    id: "health",
    name: "Health",
    icon: "💪",
    color: "hsl(142 76% 36%)",
    subcategories: [
      { id: "fitness", name: "Fitness", icon: "🏋️" },
      { id: "nutrition", name: "Nutrition", icon: "🥗" },
      { id: "sleep", name: "Sleep", icon: "😴" },
      { id: "mental", name: "Mental Health", icon: "🧠" }
    ]
  },
  {
    id: "mind",
    name: "Mind",
    icon: "🎓",
    color: "hsl(221 83% 53%)",
    subcategories: [
      { id: "learning", name: "Learning", icon: "📚" },
      { id: "skills", name: "Skills", icon: "🎯" },
      { id: "creativity", name: "Creativity", icon: "🎨" }
    ]
  },
  {
    id: "relationships",
    name: "Relationships",
    icon: "❤️",
    color: "hsl(346 77% 49%)",
    subcategories: [
      { id: "family", name: "Family", icon: "👨‍👩‍👧‍👦" },
      { id: "friends", name: "Friends", icon: "👥" },
      { id: "romantic", name: "Romantic", icon: "💕" },
      { id: "professional", name: "Professional", icon: "🤝" }
    ]
  },
  {
    id: "wealth",
    name: "Wealth",
    icon: "💰",
    color: "hsl(32 95% 44%)",
    subcategories: [
      { id: "budget", name: "Budget", icon: "📊" },
      { id: "investments", name: "Investments", icon: "📈" },
      { id: "career", name: "Career", icon: "💼" },
      { id: "business", name: "Business", icon: "🏢" }
    ]
  },
  {
    id: "purpose",
    name: "Purpose",
    icon: "🎯",
    color: "hsl(262 83% 58%)",
    subcategories: [
      { id: "goals", name: "Goals", icon: "🎯" },
      { id: "values", name: "Values", icon: "⚖️" },
      { id: "spirituality", name: "Spirituality", icon: "🕉️" },
      { id: "contribution", name: "Contribution", icon: "🤲" }
    ]
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    icon: "🌟",
    color: "hsl(280 100% 70%)",
    subcategories: [
      { id: "hobbies", name: "Hobbies", icon: "🎮" },
      { id: "travel", name: "Travel", icon: "✈️" },
      { id: "home", name: "Home", icon: "🏠" },
      { id: "style", name: "Style", icon: "👗" }
    ]
  }
];

// Normalize all categories to show exactly 5 subcategories each
export const categories = normalizeCategoriesSubcategories(rawCategories, 5);

export const getCategoryBySlug = (slug: string) => 
  categories.find(cat => cat.id === slug);

export const getSubcategoryBySlug = (categorySlug: string, subcategorySlug: string) =>
  getCategoryBySlug(categorySlug)?.subcategories?.find(sub => sub.id === subcategorySlug);