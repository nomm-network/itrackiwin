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
        .from("v_health_subs")
        .select("*")
        .order("display_order");

      if (!active) return;

      if (error || !data?.length) {
        setData({ slug: targetHubSlug, label: "Health", subs: [{ slug: "configure", label: "Configure" }] });
        return;
      }

      const subs: Sub[] = data.map((r: any) => ({
        slug: String(r.sub_slug).toLowerCase(),     // ✅ keep DB slug AS-IS
        label: FIRST_WORD(String(r.sub_label || r.sub_slug)),
        icon: r.icon || null
      }));

      // append Configure last (do not alter others):
      if (!subs.some(s => s.slug === "configure")) {
        subs.push({ slug: "configure", label: "Configure" });
      }

      setData({ 
        slug: targetHubSlug, 
        label: String(data[0]?.hub_label || "Health"), 
        subs 
      });
    })();

    return () => { active = false; };
  }, [targetHubSlug]);

  return data;
}