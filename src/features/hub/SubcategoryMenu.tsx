import { useNavigate, useSearchParams } from "react-router-dom";
import type { HubMeta } from "./useHubMeta";

export default function SubcategoryMenu({ hub }: { hub: HubMeta }) {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const active = (sp.get("sub") ?? hub.subs[0]?.slug ?? "fitness-exercise").toLowerCase();

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {hub.subs.map((s, i) => {
        const slug = s.slug.toLowerCase();                 // ✅ slug from DB
        const isActive = slug === active;
        return (
          <button
            key={slug || i}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80"
            }`}
            onClick={() => nav(`/dashboard?cat=${hub.slug}&sub=${encodeURIComponent(slug)}`)}
          >
            {s.label /* first word only; DISPLAY ONLY */}
          </button>
        );
      })}
    </div>
  );
}