import { Link, useLocation } from "react-router-dom";
import { Users, Check, Trophy, CreditCard, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  type?: "section";
  label: string;
  to?: string;
  icon?: any;
}

const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  { type: "section", label: "Ambassadors" },
  { label: "Overview", to: "/admin/ambassadors", icon: Users },
  { label: "Deals Verification", to: "/admin/ambassadors/deals", icon: Check },
  
  { type: "section", label: "Battles" },
  { label: "Battles", to: "/admin/battles", icon: Trophy },
  
  { type: "section", label: "Ops" },
  { label: "Payouts", to: "/admin/payouts", icon: CreditCard },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <nav className="space-y-2">
      {ADMIN_SIDEBAR_ITEMS.map((item, index) => {
        if (item.type === "section") {
          return (
            <div key={index} className="pt-4 pb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {item.label}
              </h3>
            </div>
          );
        }

        const Icon = item.icon;
        const isActive = location.pathname === item.to;

        return (
          <Link
            key={item.to}
            to={item.to!}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}