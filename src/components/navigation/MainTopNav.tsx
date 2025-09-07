import { Link, useLocation } from "react-router-dom";
import { Dumbbell, Grid, Compass, Building } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Training", to: "/fitness", icon: Dumbbell },
  { label: "Programs", to: "/app/programs", icon: Grid },
  { label: "Discover", to: "/marketplace", icon: Compass },
  { label: "Gyms", to: "/gyms", icon: Building },
];

export function MainTopNav() {
  const location = useLocation();

  return (
    <nav className="flex items-center space-x-6">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.to || 
          (item.to === "/fitness" && location.pathname === "/");
        
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}