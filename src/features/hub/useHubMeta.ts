import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Sub = { slug: string; label: string; icon?: string | null };
export type HubMeta = { slug: string; label: string; subs: Sub[] };

const FIRST_WORD = (s: string) => (s || "").trim().split(/\s+/)[0] ?? s;

export function useHubMeta(targetHubSlug = "health") {
  const [data, setData] = useState<HubMeta | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("v_categories_with_translations")
        .select("*")
        .eq("slug", targetHubSlug);

      if (!active) return;

      if (error || !data?.length) {
        setData({ slug: targetHubSlug, label: "Dashboard", subs: [] });
        return;
      }

      // Get subcategories for this hub
      const { data: subData, error: subError } = await supabase
        .from("v_subcategories_with_translations")
        .select("*")
        .eq("category_id", data[0].id);

      if (subError || !subData) {
        setData({ slug: targetHubSlug, label: "Dashboard", subs: [] });
        return;
      }

      const parentLabel = (data[0].translations as any)?.en?.name || "Dashboard";
      const subs: Sub[] = subData
        .map((r: any) => ({
          slug: r.slug?.toLowerCase() || r.id,
          label: FIRST_WORD((r.translations as any)?.en?.name || r.slug || r.id),
          icon: r.icon
        }));

      // Ensure Configure appears LAST (even if not in DB)
      const hasConfigure = subs.some(s => s.slug.includes("configure"));
      if (!hasConfigure) subs.push({ slug: "configure", label: "Configure" });

      setData({ slug: targetHubSlug, label: parentLabel, subs });
    })();

    return () => { active = false; };
  }, [targetHubSlug]);

  return data;
}