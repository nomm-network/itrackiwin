import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HubSub = { slug: string; label: string };
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
      // Adjust table / column names to your schema
      const { data: cat, error } = await supabase
        .from("v_categories_with_translations")
        .select("id, slug, translations")
        .eq("slug", categorySlug)
        .single();

      if (error || !cat) {
        // minimal fallback so UI never breaks
        if (alive)
          setMeta({
            slug: "health",
            name: "Health",
            subs: [
              { slug: "fitness-exercise", label: "Fitness" },
              { slug: "nutrition-hydration", label: "Nutrition" },
              { slug: "sleep-quality", label: "Sleep" },
              { slug: "medical-checkups", label: "Medical" },
              { slug: "energy-levels", label: "Energy" },
              { slug: "configure", label: "Configure" },
            ],
          });
        return;
      }

      // Get subcategories
      const { data: subcategories } = await supabase
        .from("v_subcategories_with_translations")
        .select("slug, translations, display_order")
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
            };
          }) ?? [];

      if (!subs.some((s: HubSub) => s.slug === "configure")) {
        subs.push({ slug: "configure", label: "Configure" });
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