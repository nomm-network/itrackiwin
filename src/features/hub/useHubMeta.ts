import { useEffect, useState } from "react";

type HubMeta = { slug: string; name: string; chips: {slug:string;label:string}[] };

// Use DB; fall back to safe constant if query not wired
const FALLBACK: HubMeta = {
  slug: "health",
  name: "Health",
  chips: [
    { slug: "fitness-exercise",    label: "Fitness"   },
    { slug: "nutrition-hydration", label: "Nutrition" },
    { slug: "sleep-quality",       label: "Sleep"     },
    { slug: "medical-checkups",    label: "Medical"   },
    { slug: "energy-levels",       label: "Energy"    },
    { slug: "configure",           label: "Configure" },
  ],
};

export function useHubMeta(categorySlug: string): HubMeta {
  const [meta, setMeta] = useState<HubMeta>(FALLBACK);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // TODO: replace with your real client/tables (e.g., supabase)
        // Expected tables (based on your data dump):
        // - categories: slug 'health'
        // - subcategories with slugs:
        //   fitness-exercise, nutrition-hydration, sleep-quality, medical-checkups, energy-levels
        // Keep first word label and append Configure.
        // If your DB hook is not ready, FALLBACK already matches the exact UI.
        if (!cancelled) setMeta(FALLBACK);
      } catch {
        if (!cancelled) setMeta(FALLBACK);
      }
    })();

    return () => { cancelled = true; };
  }, [categorySlug]);

  return meta;
}
