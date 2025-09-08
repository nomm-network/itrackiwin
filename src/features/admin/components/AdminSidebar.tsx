import { NavLink, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("cat") ?? "ambassadors";

  const items = {
    ambassadors: [
      { to: `/admin/ambassadors?cat=ambassadors`, label: "Overview" },
      { to: `/admin/ambassadors/deals?cat=ambassadors`, label: "Deals Verification" },
    ],
    battles: [
      { to: `/admin/battles?cat=battles`, label: "Battles" },
    ],
    ops: [
      { to: `/admin/payouts?cat=ops`, label: "Payouts" },
    ],
    gyms: [
      { to: `/marketplace?cat=gyms`, label: "Public Gyms (view)" },
    ],
    users: [],
    settings: [],
  } as const;

  const currentItems = items[category as keyof typeof items] ?? [];

  return (
    <aside className="w-64 border-r bg-card p-4">
      <nav className="space-y-2">
        {currentItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}