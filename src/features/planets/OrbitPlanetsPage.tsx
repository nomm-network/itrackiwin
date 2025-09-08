import { useNavigate } from "react-router-dom";
import { 
  Dumbbell, 
  Apple, 
  Moon, 
  Stethoscope, 
  Zap,
  DollarSign,
  PiggyBank,
  CreditCard,
  GraduationCap,
  TrendingUp,
  Heart,
  Users,
  User,
  Handshake,
  Network,
  Brain,
  Flower2,
  Eye,
  Smile,
  HeartHandshake,
  Target,
  Wrench,
  Palette,
  BookOpen,
  Trophy,
  Clock,
  Home,
  Leaf,
  HandHeart,
  Archive
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Target = { 
  cat: string; 
  sub: string; 
  label: string; 
  icon: React.ComponentType<any>;
  color?: string;
};

const TARGETS: Target[] = [
  // ========== HEALTH (5 subcategories) ==========
  { cat: "health", sub: "fitness-exercise", label: "Fitness & Exercise", icon: Dumbbell, color: "text-red-500" },
  { cat: "health", sub: "nutrition-hydration", label: "Nutrition & Hydration", icon: Apple, color: "text-green-500" },
  { cat: "health", sub: "sleep-quality", label: "Sleep Quality", icon: Moon, color: "text-blue-500" },
  { cat: "health", sub: "medical-checkups", label: "Medical Checkups", icon: Stethoscope, color: "text-pink-500" },
  { cat: "health", sub: "energy-levels", label: "Energy Levels", icon: Zap, color: "text-yellow-500" },

  // ========== WEALTH (5 subcategories) ==========
  { cat: "wealth", sub: "income-career-growth", label: "Income & Career", icon: DollarSign, color: "text-emerald-500" },
  { cat: "wealth", sub: "saving-investing", label: "Saving & Investing", icon: PiggyBank, color: "text-green-600" },
  { cat: "wealth", sub: "budgeting-debt", label: "Budgeting & Debt", icon: CreditCard, color: "text-orange-500" },
  { cat: "wealth", sub: "financial-education", label: "Financial Education", icon: GraduationCap, color: "text-blue-600" },
  { cat: "wealth", sub: "wealth-building", label: "Wealth Building", icon: TrendingUp, color: "text-purple-500" },

  // ========== RELATIONSHIPS (5 subcategories) ==========
  { cat: "relationships", sub: "family-relationships", label: "Family", icon: Heart, color: "text-red-400" },
  { cat: "relationships", sub: "romantic-life", label: "Romantic Life", icon: User, color: "text-pink-400" },
  { cat: "relationships", sub: "friendships", label: "Friendships", icon: Users, color: "text-blue-400" },
  { cat: "relationships", sub: "community-social-skills", label: "Community & Social", icon: Handshake, color: "text-cyan-500" },
  { cat: "relationships", sub: "networking-collaboration", label: "Networking", icon: Network, color: "text-indigo-500" },

  // ========== MIND & EMOTIONS (5 subcategories) ==========
  { cat: "mind", sub: "stress-management", label: "Stress Management", icon: Brain, color: "text-violet-500" },
  { cat: "mind", sub: "mindfulness-meditation", label: "Mindfulness", icon: Flower2, color: "text-purple-400" },
  { cat: "mind", sub: "self-awareness", label: "Self-Awareness", icon: Eye, color: "text-amber-500" },
  { cat: "mind", sub: "emotional-regulation", label: "Emotional Regulation", icon: Smile, color: "text-rose-400" },
  { cat: "mind", sub: "therapy-mental-health", label: "Mental Health", icon: HeartHandshake, color: "text-teal-500" },

  // ========== PURPOSE & GROWTH (5 subcategories) ==========
  { cat: "purpose", sub: "career-purpose-or-calling", label: "Career & Purpose", icon: Target, color: "text-red-600" },
  { cat: "purpose", sub: "skill-development", label: "Skill Development", icon: Wrench, color: "text-gray-600" },
  { cat: "purpose", sub: "hobbies-creativity", label: "Hobbies & Creativity", icon: Palette, color: "text-orange-400" },
  { cat: "purpose", sub: "continuous-learning", label: "Continuous Learning", icon: BookOpen, color: "text-blue-500" },
  { cat: "purpose", sub: "goal-setting", label: "Goal Setting", icon: Trophy, color: "text-yellow-600" },

  // ========== LIFESTYLE (5 subcategories) ==========
  { cat: "lifestyle", sub: "time-productivity", label: "Time & Productivity", icon: Clock, color: "text-slate-600" },
  { cat: "lifestyle", sub: "environment-organization", label: "Environment & Organization", icon: Home, color: "text-brown-500" },
  { cat: "lifestyle", sub: "minimalism-sustainability", label: "Minimalism & Sustainability", icon: Leaf, color: "text-green-400" },
  { cat: "lifestyle", sub: "volunteering-giving-back", label: "Volunteering & Giving", icon: HandHeart, color: "text-pink-600" },
  { cat: "lifestyle", sub: "legacy-projects", label: "Legacy Projects", icon: Archive, color: "text-amber-600" },
];

export default function OrbitPlanetsPage() {
  const nav = useNavigate();
  
  // Group targets by category for better organization
  const targetsByCategory = TARGETS.reduce((acc, target) => {
    if (!acc[target.cat]) {
      acc[target.cat] = [];
    }
    acc[target.cat].push(target);
    return acc;
  }, {} as Record<string, Target[]>);

  const categoryNames = {
    health: "Health",
    wealth: "Wealth", 
    relationships: "Relationships",
    mind: "Mind & Emotions",
    purpose: "Purpose & Growth",
    lifestyle: "Lifestyle"
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Life Planets Hub</h1>
        <p className="text-muted-foreground text-sm">
          Explore all {TARGETS.length} areas of life. Tap any planet to jump to its dashboard.
        </p>
      </div>
      
      {Object.entries(targetsByCategory).map(([category, targets]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold text-center">
            {categoryNames[category as keyof typeof categoryNames]} ({targets.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {targets.map((t) => {
              const IconComponent = t.icon;
              return (
                <Button
                  key={`${t.cat}:${t.sub}`}
                  variant="outline"
                  onClick={() => {
                    console.log('🚀 OrbitPlanetsPage: Navigating to /subcategory/' + t.sub);
                    nav(`/subcategory/${t.sub}`);
                  }}
                  className="h-20 flex flex-col items-center gap-2 p-3 hover:scale-105 transition-transform"
                >
                  <IconComponent 
                    className={`w-5 h-5 ${t.color || 'text-primary'}`} 
                  />
                  <span className="text-xs leading-tight text-center font-medium">
                    {t.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      ))}
      
      <div className="text-center pt-4">
        <p className="text-xs text-muted-foreground">
          Complete coverage: {TARGETS.length} life areas across 6 categories
        </p>
      </div>
    </div>
  );
}