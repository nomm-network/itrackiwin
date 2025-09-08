import { Link, useNavigate, useSearchParams } from "react-router-dom";
import type { HubMeta } from "./useHubMeta";

export default function HeaderRow({ hub }: { hub: HubMeta }) {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const active = (sp.get("sub") || hub.subs[0]?.slug || "fitness-exercise").toLowerCase();

  return (
    <div>
      {/* Title row */}
      <div className="row-between">
        <h1 style={{margin:0}}>Dashboard</h1>
        <div className="row-gap">
          <Link className="chip chip--dark" to="/admin">Admin</Link>
          <Link className="chip chip--green" to="/discover/planets">Explore by Planets</Link>
        </div>
      </div>

      <p className="muted">Track your progress across all areas of life.</p>

      {/* Subcategory chips from DB, + Configure at the end */}
      <div className="chips">
        {hub.subs.map((s) => {
          const slug = s.slug.toLowerCase();
          const isActive = slug === active;
          return (
            <button
              key={slug}
              className={`chip ${isActive ? "chip--active" : ""}`}
              onClick={() => navigate(`/dashboard?cat=${hub.slug}&sub=${slug}`)}
            >
              {s.label}
            </button>
          );
        })}
        {!hub.subs.some(s => s.slug.toLowerCase() === "configure") && (
          <button
            className={`chip ${active === "configure" ? "chip--active" : ""}`}
            onClick={() => navigate(`/dashboard?cat=${hub.slug}&sub=configure`)}
          >
            Configure
          </button>
        )}
      </div>
    </div>
  );
}