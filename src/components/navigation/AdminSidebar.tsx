import { Link, useLocation } from "react-router-dom";
import { Users, Check, Trophy, CreditCard, Settings, Dumbbell, UserCog, Globe, Wrench, FileText, Code, Activity, Cog } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItem {
  type?: "section";
  label: string;
  to?: string;
  icon?: any;
  submenu?: SidebarItem[];
}

const ADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
  { type: "section", label: "System Management" },
  { 
    label: "Setup Flow", 
    icon: Settings,
    submenu: [
      { label: "Body Taxonomy", to: "/admin/setup/body-taxonomy", icon: Users },
      { label: "Equipment", to: "/admin/setup/equipment", icon: Dumbbell },
      { label: "Grips", to: "/admin/setup/grips", icon: Settings },
      { label: "Equipment-Grip Compatibility", to: "/admin/setup/equipment-grip-compatibility", icon: Wrench },
      { label: "Movement Patterns", to: "/admin/setup/movement-patterns", icon: Activity },
      { label: "Tags & Aliases", to: "/admin/setup/tags-aliases", icon: FileText },
    ]
  },
  { label: "Exercise Management", to: "/admin/exercises", icon: Dumbbell },
  { label: "User Management", to: "/admin/users", icon: UserCog },
  { label: "Mentors Management", to: "/admin/mentors", icon: Users },
  { label: "Translations", to: "/admin/translations", icon: Globe },
  { 
    label: "Tools", 
    icon: Wrench,
    submenu: [
      { label: "Attribute Schemas", to: "/admin/attribute-schemas", icon: Code },
      { label: "Naming Templates", to: "/admin/naming-templates", icon: FileText },
      { label: "Coach Logs", to: "/admin/coach-logs", icon: Activity },
      { label: "Settings", to: "/admin/settings", icon: Cog },
    ]
  },
  
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
      {ADMIN_SIDEBAR_ITEMS.map((item, index) => renderItem(item, index))}
    </nav>
  );
}