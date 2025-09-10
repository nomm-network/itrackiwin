import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HubSub = { slug: string; label: string; icon?: string };
export type HubMeta = { slug: string; name: string; subs: HubSub[] };

function firstWord(s: string) {
  const t = String(s || "").trim();
  return t.split(/\s+/)[0] || t;
}

export function useHubMeta(categorySlug: string): HubMeta | null {
  const [meta, setMeta] = useState<HubMeta | null>(null);

  useEffect(() => {
    let alive = true;
    async function run() {
      // Use the view that already exists
      const { data: cat, error } = await supabase
        .from("v_categories_with_translations")
        .select("id, slug, translations")
        .eq("slug", categorySlug)
        .maybeSingle();

      if (error || !cat) {
        // Category-specific fallback so UI never breaks
        const fallbacks = {
          health: {
            slug: "health",
            name: "Health", 
            subs: [
              { slug: "fitness-exercise", label: "Fitness" },
              { slug: "nutrition-hydration", label: "Nutrition" },
              { slug: "sleep-quality", label: "Sleep" },
              { slug: "medical-checkups", label: "Medical" },
              { slug: "energy-levels", label: "Energy" },
            ],
          },
          wealth: {
            slug: "wealth",
            name: "Wealth",
            subs: [
              { slug: "income-career-growth", label: "Income" },
              { slug: "saving-investing", label: "Saving" },
              { slug: "budgeting-debt", label: "Budgeting" },
              { slug: "financial-education", label: "Education" },
              { slug: "wealth-building", label: "Building" },
            ],
          },
          relationships: {
            slug: "relationships", 
            name: "Relationships",
            subs: [
              { slug: "family-relationships", label: "Family" },
              { slug: "romantic-life", label: "Romance" },
              { slug: "friendships", label: "Friends" },
              { slug: "community-social-skills", label: "Community" },
              { slug: "networking-collaboration", label: "Network" },
            ],
          },
          mind: {
            slug: "mind",
            name: "Mind & Emotions",
            subs: [
              { slug: "stress-management", label: "Stress" },
              { slug: "mindfulness-meditation", label: "Mindfulness" },
              { slug: "self-awareness", label: "Awareness" },
              { slug: "emotional-regulation", label: "Emotions" },
              { slug: "therapy-mental-health", label: "Mental" },
            ],
          },
          purpose: {
            slug: "purpose",
            name: "Purpose & Growth", 
            subs: [
              { slug: "career-purpose-or-calling", label: "Career" },
              { slug: "skill-development", label: "Skills" },
              { slug: "hobbies-creativity", label: "Hobbies" },
              { slug: "continuous-learning", label: "Learning" },
              { slug: "goal-setting", label: "Goals" },
            ],
          },
          lifestyle: {
            slug: "lifestyle",
            name: "Lifestyle",
            subs: [
              { slug: "time-productivity", label: "Time" },
              { slug: "environment-organization", label: "Environment" },
              { slug: "minimalism-sustainability", label: "Minimalism" },
              { slug: "volunteering-giving-back", label: "Volunteer" },
              { slug: "legacy-projects", label: "Legacy" },
            ],
          },
        };

        const fallback = fallbacks[categorySlug as keyof typeof fallbacks] || fallbacks.health;
        if (!fallback.subs.some(s => s.slug === "configure")) {
          fallback.subs.push({ slug: "configure", label: "Configure" });
        }
        
        if (alive) setMeta(fallback);
        return;
      }

      // Get subcategories
      const { data: subcategories } = await supabase
        .from("v_subcategories_with_translations")
        .select("slug, translations, display_order, icon")
        .eq("category_id", cat.id)
        .order("display_order", { ascending: true });

      const subs =
        (subcategories || [])
          .map((s: any) => {
            const translations = s.translations as any;
            const fullName = translations?.en?.name || s.slug || "";
            return {
              slug: (s.slug || "").toLowerCase(),
              label: firstWord(fullName),
              icon: s.icon || '📋',
            };
          }) ?? [];

      if (!subs.some((s: HubSub) => s.slug === "configure")) {
        subs.push({ slug: "configure", label: "Configure", icon: "⚙️" });
      }

      const catTranslations = cat.translations as any;
      const categoryName = catTranslations?.en?.name || cat.slug || "Dashboard";

      if (alive) setMeta({ slug: cat.slug, name: categoryName, subs });
    }
    run();
    return () => {
      alive = false;
    };
  }, [categorySlug]);

  return meta;
}