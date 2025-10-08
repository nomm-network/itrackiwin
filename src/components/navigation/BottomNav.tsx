import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useBottomNav } from "@/hooks/useBottomNav";

export function BottomNav() {
  const location = useLocation();
  const { data: navItems, isLoading } = useBottomNav();

  if (isLoading || !navItems || navItems.length === 0) {
    return null;
  }

  const getPath = (item: typeof navItems[0]) => {
    switch (item.target) {
      case 'atlas':
        return '/atlas';
      case 'planets':
        return '/planets';
      case 'category_dashboard':
        return `/dashboard?cat=${item.slug}`;
      default:
        return '/';
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-screen-lg mx-auto px-2">
        {navItems.map((item) => {
          const path = getPath(item);
          const isActive = location.pathname === path;

          return (
            <Link
              key={item.slug}
              to={path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
