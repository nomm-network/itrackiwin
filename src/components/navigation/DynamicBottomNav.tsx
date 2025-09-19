import { useNavigate, useLocation } from "react-router-dom";
import { Home, Globe, Heart, DollarSign, Brain, Target, Sparkles, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBottomNav } from "@/hooks/useBottomNav";

// Icon mapping for navigation items
const iconMap = {
  home: Home,
  globe: Globe,
  category: MoreHorizontal,
  // Life category icons
  health: Heart,
  wealth: DollarSign,
  relationships: Heart,
  mind: Brain,
  purpose: Target,
  lifestyle: Sparkles,
};

function getIconComponent(iconName: string) {
  return iconMap[iconName as keyof typeof iconMap] || iconMap.category;
}

function getRouteForSlug(slug: string) {
  switch (slug) {
    case 'dashboard':
      return '/dashboard';
    case 'atlas':
      return '/dashboard'; // Atlas goes to main dashboard
    case 'planets':
      return '/planets'; // Planets goes to orbital planets page
    default:
      // For life categories, navigate to their dashboard with category parameter
      return `/dashboard?cat=${slug}`;
  }
}

export function DynamicBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: navItems, isLoading, error } = useBottomNav();

  // Fallback items if query fails or is loading
  const fallbackItems = [
    { slot: 1, item_type: 'fixed' as const, label: 'Dashboard', slug: 'dashboard', icon: 'home' },
    { slot: 2, item_type: 'fixed' as const, label: 'Atlas', slug: 'atlas', icon: 'globe' },
  ];

  const items = navItems || fallbackItems;

  const currentPath = location.pathname;
  
  const isActive = (slug: string) => {
    const route = getRouteForSlug(slug);
    return currentPath === route || 
           (slug === 'dashboard' && currentPath === '/') ||
           (slug === 'atlas' && currentPath === '/planets');
  };

  const handleNavigation = (slug: string) => {
    const route = getRouteForSlug(slug);
    navigate(route);
  };

  if (error) {
    console.error('Bottom nav error:', error);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-4">
        {items.slice(0, 5).map((item) => {
          const IconComponent = getIconComponent(item.icon);
          const active = isActive(item.slug);
          
          return (
            <button
              key={item.slug}
              onClick={() => handleNavigation(item.slug)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-colors",
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <IconComponent className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium truncate w-full text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </nav>
  );
}