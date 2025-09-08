import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HubSubcategory = { slug: string; label: string; icon?: string | null };
export type HubMeta = { slug: string; name: string; subs: HubSubcategory[] };

const FIRST_WORD = (s: string) => (s || "").split(/\s+/)[0];

export function useHubMeta(categorySlugOrId?: string) {
  const [hub, setHub] = useState<HubMeta | null>(null);
  const wanted = (categorySlugOrId || "health").toLowerCase();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // 1) load the category by slug or id
        const { data: catRow, error: catErr } = await supabase
          .from("life_categories")
          .select("id, slug, name")
          .or(`slug.eq.${wanted},id.eq.${wanted}`)
          .maybeSingle();

        if (catErr || !catRow) {
          if (!cancelled) setHub(null);
          return;
        }

        // 2) load its subcategories with translations (ordered)
        const { data: subsRows } = await supabase
          .from("v_subcategories_with_translations")
          .select("slug, translations, display_order")
          .eq("category_id", catRow.id)
          .order("display_order", { ascending: true });

        // 3) map to chip model and append Configure at the end
        const subs: HubSubcategory[] = (subsRows || []).map((r) => {
          const translations = r.translations as any;
          const name = translations?.en?.name || r.slug || "";
          return {
            slug: String(r.slug || "").toLowerCase(),         // <- DB slug drives URL
            label: FIRST_WORD(String(name)), // <- first word for chip
          };
        });

        if (!subs.some((s) => s.slug === "configure")) {
          subs.push({ slug: "configure", label: "Configure" });
        }

        if (!cancelled) {
          setHub({
            slug: String(catRow.slug || catRow.id).toLowerCase(),
            name: catRow.name,
            subs,
          });
        }
      } catch {
        if (!cancelled) setHub(null);
      }
    })();

    return () => { cancelled = true; };
  }, [wanted]);

  return hub;
}
