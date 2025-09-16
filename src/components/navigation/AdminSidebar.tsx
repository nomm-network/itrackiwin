import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Users, Check, Trophy, CreditCard, Settings, Dumbbell, UserCog, Globe, Wrench, FileText, Code, Activity, Cog } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  type?: "section";
  label: string;
  to?: string;
  icon?: any;
  submenu?: SidebarItem[];
}

const CATEGORY_ITEMS = {
  ambassadors: [
    { label: "Overview", to: "/admin/ambassadors?cat=ambassadors", icon: Users },
    { label: "Deals Verification", to: "/admin/ambassadors/deals?cat=ambassadors", icon: Check },
  ],
  battles: [
    { label: "Battles", to: "/admin/battles?cat=battles", icon: Trophy },
  ],
  ops: [
    { label: "Payouts", to: "/admin/payouts?cat=ops", icon: CreditCard },
  ],
  gyms: [
    { label: "Public Gyms (view)", to: "/marketplace?cat=gyms", icon: Globe },
  ],
  users: [
    { label: "User Management", to: "/admin/users?cat=users", icon: UserCog },
    { label: "Mentors Management", to: "/admin/mentors?cat=users", icon: Users },
  ],
  settings: [
    { 
      label: "System Management", 
      icon: Settings,
      submenu: [
        { label: "Body Taxonomy", to: "/admin/setup/body-taxonomy?cat=settings", icon: Users },
        { label: "Equipment", to: "/admin/setup/equipment?cat=settings", icon: Dumbbell },
        { label: "Grips", to: "/admin/setup/grips?cat=settings", icon: Settings },
        { label: "Movement Patterns", to: "/admin/setup/movement-patterns?cat=settings", icon: Activity },
      ]
    },
    { label: "Exercise Management", to: "/admin/exercises?cat=settings", icon: Dumbbell },
    { label: "Translations", to: "/admin/translations?cat=settings", icon: Globe },
    { 
      label: "Tools", 
      icon: Wrench,
      submenu: [
        { label: "Attribute Schemas", to: "/admin/attribute-schemas?cat=settings", icon: Code },
        { label: "Coach Logs", to: "/admin/coach-logs?cat=settings", icon: Activity },
        { label: "Settings", to: "/admin/settings?cat=settings", icon: Cog },
      ]
    },
  ],
} as const;

export function AdminSidebar() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("cat") ?? "ambassadors";
  
  const items = CATEGORY_ITEMS[category as keyof typeof CATEGORY_ITEMS] ?? [];

  const renderItem = (item: SidebarItem, index: number, isSubmenu = false) => {
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
    const isActive = item.to ? location.pathname === item.to : false;
    const hasActiveSubmenu = item.submenu?.some(sub => sub.to && location.pathname === sub.to);

    if (item.submenu) {
      return (
        <div key={item.label} className="space-y-1">
          <div className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium",
            hasActiveSubmenu 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground"
          )}>
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </div>
          <div className="ml-6 space-y-1">
            {item.submenu.map((subItem, subIndex) => renderItem(subItem, subIndex, true))}
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.to}
        to={item.to!}
        className={cn(
          "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isSubmenu ? "pl-6" : "",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        {Icon && <Icon className="h-4 w-4" />}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <nav className="space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto">
      {items.map((item, index) => renderItem(item, index))}
    </nav>
  );
}