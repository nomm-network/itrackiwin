import { NavLink, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const [searchParams] = useSearchParams();
  const lifeCategory = searchParams.get("life_cat") ?? "health";
  const subcategory = searchParams.get("subcat") ?? "fitness";
  const adminClass = searchParams.get("class") ?? "ambassadors";

  const buildUrl = (path: string) => `${path}?life_cat=${lifeCategory}&subcat=${subcategory}&class=${adminClass}`;

  const items = {
    ambassadors: [
      { to: buildUrl(`/admin/ambassadors`), label: "Overview" },
      { to: buildUrl(`/admin/ambassadors/deals`), label: "Deals Verification" },
    ],
    battles: [
      { to: buildUrl(`/admin/battles`), label: "Battles" },
    ],
    ops: [
      { to: buildUrl(`/admin/payouts`), label: "Payouts" },
    ],
    gyms: [
      { to: buildUrl(`/marketplace`), label: "Public Gyms (view)" },
    ],
    users: [],
    settings: [
      { to: buildUrl(`/admin/setup/body-taxonomy`), label: "Body Taxonomy" },
      { to: buildUrl(`/admin/setup/equipment`), label: "Equipment" },
      { to: buildUrl(`/admin/setup/grips`), label: "Grips" },
      { to: buildUrl(`/admin/setup/movement-patterns`), label: "Movement Patterns" },
      { to: buildUrl(`/admin/exercises`), label: "Exercise Management" },
      { to: buildUrl(`/admin/translations`), label: "Translations" },
      { to: buildUrl(`/admin/attribute-schemas`), label: "Attribute Schemas" },
      { to: buildUrl(`/admin/coach-logs`), label: "Coach Logs" },
      { to: buildUrl(`/admin/settings`), label: "Settings" },
    ],
  } as const;

  const currentItems = items[adminClass as keyof typeof items] ?? [];

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