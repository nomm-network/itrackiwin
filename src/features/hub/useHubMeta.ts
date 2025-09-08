import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type HubSub = { slug: string; label: string };
export type HubMeta = { slug: string; name: string; subs: HubSub[] };

const FIRST_WORD = (s: string) => String(s || "").trim().split(/\s+/)[0];

export function useHubMeta(categorySlug: string): HubMeta | null {
  const [meta, setMeta] = useState<HubMeta | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      const wanted = (categorySlug || "health").toLowerCase();

      // 🔒 STEP 1: fetch the category by slug ONLY (no bulk lists, no limits)
      const { data: cat, error: catErr } = await supabase
        .from("life_categories")
        .select("id, slug, name")
        .eq("slug", wanted)
        .maybeSingle();

      if (catErr || !cat) {
        if (alive) setMeta(null);
        if (process.env.NODE_ENV !== "production") {
          console.warn("[useHubMeta] category not found for", wanted, catErr);
        }
        return;
      }

      // 🔒 STEP 2: fetch all subcategories by category_id (no nested select limits)
      const { data: subsRows, error: subsErr } = await supabase
        .from("life_subcategories")
        .select("slug, name, display_order")
        .eq("category_id", cat.id)
        .order("display_order", { ascending: true });

      if (subsErr) {
        if (alive) setMeta({ slug: cat.slug, name: cat.name, subs: [{ slug: "configure", label: "Configure" }] });
        if (process.env.NODE_ENV !== "production") {
          console.warn("[useHubMeta] subcategories load error", subsErr);
        }
        return;
      }

      const subs: HubSub[] = (subsRows || []).map((r: any) => ({
        slug: String(r.slug || "").toLowerCase(),     // DB slug verbatim
        label: FIRST_WORD(r.name || r.slug || ""),    // first-word label
      }));

      // always append Configure last
      if (!subs.some((s) => s.slug === "configure")) {
        subs.push({ slug: "configure", label: "Configure" });
      }

      if (alive) setMeta({ slug: cat.slug, name: cat.name, subs });
    })();

    return () => { alive = false; };
  }, [categorySlug]);

  return meta;
}