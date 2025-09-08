import { Link, useSearchParams, useNavigate } from "react-router-dom";
import type { HubMeta } from "./useHubMeta";

// Renders: Title, Admin chip, Planets chip, THEN the subcategory chips row.
export default function HeaderRow({ hub }: { hub: HubMeta }) {
  const [sp] = useSearchParams();
  const nav = useNavigate();

  // active sub from URL; fallback to the 1st DB sub; final fallback = fitness
  const active = (sp.get("sub") || hub.subs[0]?.slug || "fitness-exercise").toLowerCase();

  return (
    <div>
      {/* Title row */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link to="/admin" className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-muted hover:bg-muted/80 transition-colors">
            Admin
          </Link>
          <Link to="/discover/planets" className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Explore by Planets
          </Link>
        </div>
      </div>

      {/* Tagline */}
      <p className="text-muted-foreground mb-4">Track your progress across all areas of life.</p>

      {/* Subcategory chips (DB order) + Configure (static last) */}
      <div className="flex flex-wrap gap-2 mb-6">
        {hub.subs.map(s => {
          const slug = s.slug.toLowerCase();
          const isActive = slug === active;
          return (
            <button
              key={slug}
              className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted hover:bg-muted/80"
              }`}
              onClick={() => nav(`/dashboard?cat=${hub.slug}&sub=${slug}`)}
            >
              {s.label}
            </button>
          );
        })}
        <button
          className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            active === "configure"
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => nav(`/dashboard?cat=${hub.slug}&sub=configure`)}
        >
          Configure
        </button>
      </div>
    </div>
  );
}