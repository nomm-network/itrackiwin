import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Sub = { id: string; slug: string; label: string };
export type HubMeta = { slug: "health"; label: string; subs: Sub[] };

const FIRST_WORD = (s: string) => (s || "").trim().split(/\s+/)[0] || s;

export function useHubMeta() {
  const [hub, setHub] = useState<HubMeta | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("v_health_subs")
        .select("hub_label,sub_id,sub_slug,sub_label,display_order")
        .order("display_order", { ascending: true });

      if (!alive) return;

      if (error || !data?.length) {
        setHub({
          slug: "health",
          label: "Health",
          subs: [{ id: "configure", slug: "configure", label: "Configure" }],
        });
        return;
      }

      const subs: Sub[] = (data as any[]).map(r => ({
        id: String(r.sub_id),
        slug: String(r.sub_slug).toLowerCase(),                 // use your real slugs
        label: FIRST_WORD(String(r.sub_label || r.sub_slug)),   // chip text = first word
      }));

      if (!subs.some(s => s.slug === "configure")) {
        subs.push({ id: "configure", slug: "configure", label: "Configure" });
      }

      setHub({ slug: "health", label: String(data[0].hub_label || "Health"), subs });
    })();

    return () => { alive = false; };
  }, []);

  return hub;
}