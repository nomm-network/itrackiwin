import { useNavigate, useSearchParams } from "react-router-dom";
import type { HubMeta } from "./useHubMeta";

export default function SubcategoryMenu({ hub }: { hub: HubMeta }) {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const activeSub = (sp.get("sub") ?? hub.subs[0]?.slug ?? "").toLowerCase();

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {hub.subs.map((s, i) => (
        <button
          key={s.slug || i}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            s.slug.toLowerCase() === activeSub 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => nav(`/dashboard?sub=${encodeURIComponent(s.slug)}`)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}