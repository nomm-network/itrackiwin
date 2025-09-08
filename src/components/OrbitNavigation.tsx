import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslations } from "@/hooks/useTranslations";
interface OrbitNavigationProps {
  centerImageSrc?: string;
}
const categoryIcon = (name: string): string => {
  const map: Record<string, string> = {
    "Health": "🩺",
    "Mind & Emotions": "🧠",
    "Relationships": "❤️",
    "Wealth": "💰",
    "Purpose & Growth": "🎯",
    "Lifestyle & Contribution": "🌟"
  };
  return map[name] ?? "🪐";
};
const subcategoryIcon = (name: string): string => {
  const map: Record<string, string> = {
    "Fitness & exercise": "🏋️",
    "Fitness and Exercise": "🏋️",
    "Sleep": "🛌",
    "Nutrition": "🍎",
    "Meditation": "🧘",
    "Learning": "📚",
    "Finance": "📈",
    "Long-term wealth building": "🏦",
    "Career": "💼",
    "Family": "👨‍👩‍👧‍👦",
    "Friends": "🤝",
    "Romantic life": "💞",
    "Hobbies": "🎨",
    "Contribution": "🤲",
    "Travel": "✈️",
    "Growth": "🌱",
    "Purpose": "🎯",
    "Emotions": "💬"
  };
  return map[name] ?? "🔹";
};

// Map display names to dashboard category/subcategory slugs
const getCategoryAndSubSlug = (categoryName: string, subcategoryName: string): { cat: string; sub: string } => {
  const categoryMap: Record<string, string> = {
    "Health": "health",
    "Wealth": "wealth", 
    "Relationships": "relationships",
    "Mind & Emotions": "mind",
    "Purpose & Growth": "purpose",
    "Lifestyle & Contribution": "lifestyle",
    "Lifestyle": "lifestyle" // Added fallback for "Lifestyle"
  };

  const subcategoryMap: Record<string, string> = {
    // Health
    "Fitness & exercise": "fitness-exercise",
    "Fitness and Exercise": "fitness-exercise", 
    "Fitness": "fitness-exercise",
    "Nutrition": "nutrition-hydration",
    "Nutrition & hydration": "nutrition-hydration",
    "Sleep": "sleep-quality",
    "Sleep quality": "sleep-quality",
    "Medical": "medical-checkups",
    "Medical checkups": "medical-checkups",
    "Energy": "energy-levels",
    "Energy levels": "energy-levels",
    
    // Wealth
    "Income": "income-career-growth",
    "Income & career growth": "income-career-growth",
    "Career": "income-career-growth",
    "Saving": "saving-investing",
    "Saving & investing": "saving-investing",
    "Investing": "saving-investing",
    "Long-term wealth building": "wealth-building",
    "Wealth building": "wealth-building",
    "Budgeting": "budgeting-debt",
    "Budgeting & debt": "budgeting-debt",
    "Finance": "financial-education",
    "Financial education": "financial-education",
    
    // Relationships
    "Family": "family-relationships",
    "Family relationships": "family-relationships",
    "Romantic life": "romantic-life", 
    "Friends": "friendships",
    "Friendships": "friendships",
    "Community": "community-social-skills",
    "Community & social skills": "community-social-skills",
    "Networking": "networking-collaboration",
    "Networking & collaboration": "networking-collaboration",
    
    // Mind & Emotions
    "Stress": "stress-management",
    "Stress management": "stress-management",
    "Meditation": "mindfulness-meditation",
    "Mindfulness": "mindfulness-meditation",
    "Mindfulness & meditation": "mindfulness-meditation",
    "Self-awareness": "self-awareness",
    "Emotions": "emotional-regulation",
    "Emotional regulation": "emotional-regulation",
    "Therapy": "therapy-mental-health",
    "Therapy & mental health": "therapy-mental-health",
    
    // Purpose & Growth  
    "Purpose": "career-purpose-or-calling",
    "Career purpose or calling": "career-purpose-or-calling",
    "Skills": "skill-development",
    "Skill development": "skill-development",
    "Hobbies": "hobbies-creativity",
    "Hobbies & creativity": "hobbies-creativity",
    "Learning": "continuous-learning",
    "Continuous learning": "continuous-learning",
    "Goals": "goal-setting",
    "Goal setting": "goal-setting",
    
    // Lifestyle
    "Time": "time-productivity",
    "Time & productivity": "time-productivity",
    "Environment": "environment-organization", 
    "Environment & organization": "environment-organization",
    "Environment & home organization": "environment-organization",
    "Minimalism": "minimalism-sustainability",
    "Minimalism & sustainability": "minimalism-sustainability",
    "Volunteering": "volunteering-giving-back",
    "Volunteering & giving back": "volunteering-giving-back",
    "Legacy": "legacy-projects",
    "Legacy projects": "legacy-projects",
    "Fun, travel & leisure": "hobbies-creativity", // Map to hobbies & creativity as it's leisure-related
  };

  console.log('🔍 getCategoryAndSubSlug called with:', { categoryName, subcategoryName });
  
  const cat = categoryMap[categoryName] || "health";
  const sub = subcategoryMap[subcategoryName] || (cat === "health" ? "fitness-exercise" : "configure");
  
  console.log('🔍 getCategoryAndSubSlug result:', { cat, sub, foundInMap: !!subcategoryMap[subcategoryName] });
  
  return { cat, sub };
};
const OrbitNavigation: React.FC<OrbitNavigationProps> = ({
  centerImageSrc
}) => {
  const navigate = useNavigate();
  const { getTranslatedName } = useTranslations();
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({
      data
    }) => setUserId(data.user?.id ?? null));
  }, []);
  const DEFAULT_ORDER = ["Health", "Wealth", "Relationships", "Mind & Emotions", "Purpose & Growth", "Lifestyle & Contribution"];
  type OrbitArea = {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null; // HSL string like "152 76% 66%"
    subcategories: string[];
  };
  const {
    data: categories = []
  } = useQuery({
    queryKey: ["life_categories_orbit"],
    queryFn: async () => {
      const {
        data,
        error
      } = await (supabase as any).from("v_categories_with_translations").select("id, translations, icon, color, display_order").order("display_order", {
        ascending: true
      });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        translations: Record<string, { name: string; description?: string }> | null;
        icon?: string | null;
        color?: string | null;
      }>;
    }
  });
  const {
    data: subcategories = []
  } = useQuery({
    queryKey: ["life_subcategories_orbit"],
    queryFn: async () => {
      const {
        data,
        error
      } = await (supabase as any).from("v_subcategories_with_translations").select("id, category_id, translations, display_order").order("display_order", {
        ascending: true
      });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        category_id: string;
        translations: Record<string, { name: string; description?: string }> | null;
      }>;
    }
  });
  const {
    data: prefs = []
  } = useQuery({
    queryKey: ["user_category_prefs_orbit"],
    enabled: !!userId,
    queryFn: async () => {
      const {
        data,
        error
      } = await (supabase as any).from("user_category_prefs").select("category_id, display_order");
      if (error) throw error;
      return (data ?? []) as Array<{
        category_id: string;
        display_order: number;
      }>;
    }
  });
  const {
    data: pins = []
  } = useQuery({
    queryKey: ["user_pins_orbit"],
    enabled: !!userId,
    queryFn: async () => {
      const {
        data,
        error
      } = await (supabase as any).from("user_pinned_subcategories").select("subcategory_id");
      if (error) throw error;
      return (data ?? []) as Array<{
        subcategory_id: string;
      }>;
    }
  });
  const subByCat = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const s of subcategories) {
      const name = getTranslatedName(s);
      m[s.category_id] = m[s.category_id] || [];
      m[s.category_id].push(name);
    }
    return m;
  }, [subcategories, getTranslatedName]);
  const areasArr = useMemo<OrbitArea[]>(() => {
    const orderIndex = (id: string, name: string) => {
      const pref = prefs.find(p => p.category_id === id);
      if (pref) return pref.display_order;
      const idx = DEFAULT_ORDER.indexOf(name);
      return idx === -1 ? 999 : idx;
    };
    const sorted = [...categories].sort((a, b) => {
      const aName = getTranslatedName(a);
      const bName = getTranslatedName(b);
      const ai = orderIndex(a.id, aName);
      const bi = orderIndex(b.id, bName);
      if (ai !== bi) return ai - bi;
      return aName.localeCompare(bName);
    });
    return sorted.map(c => {
      const name = getTranslatedName(c);
      return {
        id: c.id,
        name,
        icon: c.icon && c.icon.trim().length > 0 ? c.icon : categoryIcon(name),
        color: c.color ?? null,
        subcategories: subByCat[c.id] || []
      };
    });
  }, [categories, subByCat, prefs, getTranslatedName]);
  const [selected, setSelected] = useState<OrbitArea | null>(null);
  const [isSmall, setIsSmall] = useState<boolean>(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsSmall(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const radius = isSmall ? 120 : 220;

  // Build pinned items (max 3)
  const subById = useMemo(() => {
    const m: Record<string, {
      id: string;
      category_id: string;
      name: string;
    }> = {};
    for (const s of subcategories) {
      const name = getTranslatedName(s);
      m[s.id] = { id: s.id, category_id: s.category_id, name };
    }
    return m;
  }, [subcategories, getTranslatedName]);
  const pinnedItems = useMemo(() => {
    const defaults = ["Fitness & exercise", "Long-term wealth building", "Romantic life"];
    let list = pins.length ? pins.map(p => subById[p.subcategory_id]).filter(Boolean) : defaults.map(n => subcategories.find(s => getTranslatedName(s) === n)).filter(Boolean).map(s => ({ id: s.id, category_id: s.category_id, name: getTranslatedName(s) }));
    // dedupe by id and limit 3
    const seen = new Set<string>();
    const final: Array<{
      id: string;
      category_id: string;
      name: string;
    }> = [];
    for (const s of list) {
      if (!s || seen.has(s.id)) continue;
      seen.add(s.id);
      final.push(s);
      if (final.length === 3) break;
    }
    return final;
  }, [pins, subById, subcategories, getTranslatedName]);
  return <div className="w-full">
      <div className="mx-auto max-w-[720px] mb-4 flex flex-wrap items-center justify-center gap-2">
        {pinnedItems.map(s => {
        const cat = categories.find(c => c.id === s.category_id);
        const bg = cat?.color ? `hsl(${cat.color})` : 'hsl(var(--primary))';
        const shadow = cat?.color ? `0 0 0 2px hsl(${cat.color} / 0.45), 0 0 28px hsl(${cat.color} / 0.6)` : `0 0 0 2px hsl(var(--primary) / 0.45), 0 0 28px hsl(var(--primary) / 0.6)`;
        return <button key={s.id} className="rounded-full px-3 py-2 text-xs sm:text-sm font-medium text-[hsl(var(--primary-foreground))] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/80" style={{
          background: bg,
          boxShadow: shadow
        }} onClick={() => {
          const category = categories.find(c => c.id === s.category_id);
          const categoryName = category ? getTranslatedName(category) : "Health";
          const { cat, sub } = getCategoryAndSubSlug(categoryName, s.name);
          console.log('🌍 OrbitNavigation: Navigating to /subcategory/' + sub);
          navigate(`/subcategory/${sub}`);
        }}>
              <span className="mr-1" aria-hidden>{subcategoryIcon(s.name)}</span>
              {s.name}
            </button>;
      })}
      </div>
      <div className="relative mx-auto w-full max-w-[360px] sm:max-w-[720px] aspect-square">
      {/* Center avatar/logo or Back to main */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {selected ? <button className="size-32 sm:size-36 rounded-full border border-border bg-card shadow-[var(--shadow-elegant)] grid place-items-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring" onClick={() => setSelected(null)} aria-label="Back to main areas" title="Back">
            <div className="text-center px-3 leading-tight">
              <div className="text-sm font-semibold">I Track I Win</div>
              <div className="text-[10px] text-muted-foreground mt-1">(tap to go back)</div>
            </div>
          </button> : <div className="size-32 sm:size-36 rounded-full border border-border bg-card shadow-[var(--shadow-elegant)] grid place-items-center overflow-hidden">
            <div className="text-center px-3 leading-tight">
              <div className="text-sm font-semibold">I Track. I Win.</div>
            </div>
          </div>}
      </div>

      {/* Orbits */}
      {selected ?
      // Subcategory orbit
      selected.subcategories?.length ? selected.subcategories.map((name, i) => {
        const angle = i / selected.subcategories!.length * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const size = isSmall ? 44 : 56;
        const style: React.CSSProperties = {
          width: size,
          height: size,
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          background: selected.color ? `hsl(${selected.color})` : 'hsl(var(--primary))',
          boxShadow: `0 0 0 2px ${selected.color ? `hsl(${selected.color} / 0.45)` : 'hsl(var(--primary) / 0.45)'}, 0 0 28px ${selected.color ? `hsl(${selected.color} / 0.6)` : 'hsl(var(--primary) / 0.6)'}`
        };
        const labelTopOffset = y + size / 2 + 12;
        return <React.Fragment key={name}>
                <button style={style} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full text-sm font-medium text-[hsl(var(--primary-foreground))] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/80 hover:scale-105 transition-transform" aria-label={`${name}`} onClick={() => {
            const { cat, sub } = getCategoryAndSubSlug(selected.name, name);
            console.log('🌍 OrbitNavigation: Button click to /subcategory/' + sub);
            navigate(`/subcategory/${sub}`);
          }} onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              const { cat, sub } = getCategoryAndSubSlug(selected.name, name);
              console.log('🌍 OrbitNavigation: Keyboard nav to /subcategory/' + sub);
              navigate(`/subcategory/${sub}`);
            }
          }}>
                  <div className="grid place-items-center size-full">
                    <div className="text-xs" aria-hidden>{subcategoryIcon(name)}</div>
                  </div>
                </button>
                <div className="absolute -translate-x-1/2 text-[10px] sm:text-xs text-muted-foreground pointer-events-none" style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${labelTopOffset}px)`
          }} aria-hidden>
                  {name}
                </div>
              </React.Fragment>;
      }) : null :
      // Main areas orbit (from DB)
      areasArr.map((a, i) => {
        const step = Math.PI * 2 / Math.max(areasArr.length, 1);
        const angleStart = Math.PI; // start at 9 o'clock
        const angle = angleStart + i * step; // clockwise from 9 o'clock
        const progress = 0; // TODO: hook up progress when streaks are available per category
        const base = isSmall ? 48 : 64;
        const scale = isSmall ? 24 : 36;
        const size = base + progress * scale; // responsive planet size
        const glowAlpha = 0.25 + progress * 0.45; // 0.25..0.7
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const style: React.CSSProperties = {
          width: size,
          height: size,
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          background: a.color ? `hsl(${a.color})` : 'hsl(var(--primary))',
          boxShadow: `0 0 0 2px ${a.color ? `hsl(${a.color} / 0.45)` : 'hsl(var(--primary) / 0.45)'}, 0 0 28px ${a.color ? `hsl(${a.color} / ${glowAlpha})` : `hsl(var(--primary) / ${glowAlpha})`}`
        };
        const labelTopOffset = y + size / 2 + 12;
        return <React.Fragment key={a.id}>
              <button style={style} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full text-sm font-medium text-[hsl(var(--primary-foreground))] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring/80 hover:scale-105 transition-transform" aria-label={`${a.name}`} onClick={() => setSelected(a)} onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelected(a);
            }
          }}>
                <div className="grid place-items-center size-full">
                  <div className="text-2xl" aria-hidden>{a.icon || "●"}</div>
                </div>
              </button>
              <div className="absolute -translate-x-1/2 text-[10px] sm:text-xs text-muted-foreground pointer-events-none" style={{
            left: `calc(50% + ${x}px)`,
            top: `calc(50% + ${labelTopOffset}px)`
          }} aria-hidden>
                {`${i + 1}. ${a.name}`}
              </div>
            </React.Fragment>;
      })}
      </div>
    </div>;
};
export default OrbitNavigation;