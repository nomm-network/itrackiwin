import { Link } from "react-router-dom";

export default function HeaderRow() {
  return (
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
  );
}