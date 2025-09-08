import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HubSubcategory = { slug: string; label: string; icon?: string | null };
export type HubMeta = { slug: string; name: string; subs: HubSubcategory[] };

const FIRST_WORD = (s: string) => {
  const cleaned = (s || "").trim();
  // Handle cases like "Fitness & exercise" -> "Fitness", "Medical check-ups & prevention" -> "Medical"
  const firstWord = cleaned.split(/[\s&-]+/)[0];
  return firstWord || cleaned;
};

export function useHubMeta(categorySlugOrId?: string) {
  const [hub, setHub] = useState<HubMeta | null>(null);
  const wanted = (categorySlugOrId || "health").toLowerCase();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1) load the category by slug or id
        const { data: catRow, error: catErr } = await supabase
          .from("v_categories_with_translations")
          .select("id, slug, translations")
          .or(`slug.eq.${wanted},id.eq.${wanted}`)
          .maybeSingle();

        if (catErr || !catRow) {
          console.error("Category fetch error:", catErr);
          if (!cancelled) setHub(null);
          return;
        }

        // 2) load its subcategories with translations (ordered)
        const { data: subsRows, error: subsErr } = await supabase
          .from("v_subcategories_with_translations")
          .select("slug, translations, display_order")
          .eq("category_id", catRow.id)
          .order("display_order", { ascending: true });

        if (subsErr) {
          console.error("Subcategories fetch error:", subsErr);
          if (!cancelled) setHub(null);
          return;
        }

        // 3) map to chip model and append Configure at the end
        const subs: HubSubcategory[] = (subsRows || []).map((r) => {
          const translations = r.translations as any;
          const fullName = translations?.en?.name || r.slug || "";
          const firstWord = FIRST_WORD(fullName);
          
          return {
            slug: String(r.slug || "").toLowerCase(),         // <- DB slug drives URL (e.g., "fitness-exercise")
            label: firstWord, // <- first word for chip (e.g., "Fitness" from "Fitness & exercise")
          };
        });

        if (!subs.some((s) => s.slug === "configure")) {
          subs.push({ slug: "configure", label: "Configure" });
        }

        if (!cancelled) {
          const catTranslations = catRow.translations as any;
          const categoryName = catTranslations?.en?.name || catRow.slug || "Dashboard";
          setHub({
            slug: String(catRow.slug || catRow.id).toLowerCase(),
            name: categoryName,
            subs,
          });
        }
      } catch (error) {
        console.error("useHubMeta error:", error);
        if (!cancelled) setHub(null);
      }
    })();

    return () => { cancelled = true; };
  }, [wanted]);

  return hub;
}
