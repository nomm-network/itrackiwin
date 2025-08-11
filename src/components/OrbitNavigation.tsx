import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
const OrbitNavigation: React.FC<OrbitNavigationProps> = ({
  centerImageSrc
}) => {
  const navigate = useNavigate();
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
      } = await (supabase as any).from("life_categories").select("id, name, icon, color, display_order").order("display_order", {
        ascending: true
      }).order("name", {
        ascending: true
      });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        name: string;
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
      } = await (supabase as any).from("life_subcategories").select("id, category_id, name, display_order").order("display_order", {
        ascending: true
      }).order("name", {
        ascending: true
      });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        category_id: string;
        name: string;
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
      m[s.category_id] = m[s.category_id] || [];
      m[s.category_id].push(s.name);
    }
    return m;
  }, [subcategories]);
  const areasArr = useMemo<OrbitArea[]>(() => {
    const orderIndex = (id: string, name: string) => {
      const pref = prefs.find(p => p.category_id === id);
      if (pref) return pref.display_order;
      const idx = DEFAULT_ORDER.indexOf(name);
      return idx === -1 ? 999 : idx;
    };
    const sorted = [...categories].sort((a, b) => {
      const ai = orderIndex(a.id, a.name);
      const bi = orderIndex(b.id, b.name);
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    });
    return sorted.map(c => ({
      id: c.id,
      name: c.name,
      icon: c.icon && c.icon.trim().length > 0 ? c.icon : categoryIcon(c.name),
      color: c.color ?? null,
      subcategories: subByCat[c.id] || []
    }));
  }, [categories, subByCat, prefs]);
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
    for (const s of subcategories) m[s.id] = s;
    return m;
  }, [subcategories]);
  const pinnedItems = useMemo(() => {
    const defaults = ["Fitness & exercise", "Long-term wealth building", "Romantic life"];
    let list = pins.length ? pins.map(p => subById[p.subcategory_id]).filter(Boolean) : defaults.map(n => subcategories.find(s => s.name === n)).filter(Boolean);
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
  }, [pins, subById, subcategories]);
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
          if (s.name === "Fitness & exercise" || s.name === "Fitness and Exercise") {
            navigate("/fitness");
          } else {
            const area = areasArr.find(a => a.id === s.category_id) || null;
            setSelected(area);
          }
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
            if (name === "Fitness & exercise") {
              navigate("/fitness");
            }
          }} onKeyDown={e => {
            if ((e.key === "Enter" || e.key === " ") && name === "Fitness & exercise") {
              e.preventDefault();
              navigate("/fitness");
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
        const angle = angleStart - i * step; // clockwise
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
                {a.name}
              </div>
            </React.Fragment>;
      })}
      </div>
    </div>;
};
export default OrbitNavigation;