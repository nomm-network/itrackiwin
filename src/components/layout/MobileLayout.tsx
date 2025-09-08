import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Home, TrendingUp, BookOpen, Target, User, Settings, Dumbbell, Users, Award, Grid, Compass, Building, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";
import { ProfileAvatarMenu } from "@/components/navigation/ProfileAvatarMenu";
import { usePinnedSubcategories } from "@/hooks/usePinnedSubcategories";

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  const { data: pinnedSubcategories = [] } = usePinnedSubcategories();

  // Create dynamic navigation based on pinned subcategories
  const getDynamicNavigation = () => {
    const baseNavigation = [
      { name: "Fitness", href: "/dashboard", icon: Home },
      { name: "Discover", href: "/marketplace", icon: Compass },
    ];

    // Get pinned subcategories, excluding fitness since we always show it as base
    const nonFitnessPins = pinnedSubcategories.filter(pin => 
      pin.subcategory?.slug !== "fitness"
    );

    // Add up to 2 pinned subcategories
    const subcatNavigation = nonFitnessPins
      .slice(0, 2)
      .map(pin => ({
        name: pin.subcategory?.translations?.find(t => t.language_code === "en")?.name || pin.subcategory?.slug || "Unknown",
        href: `/life/health/${pin.subcategory?.slug}`,
        icon: Target, // Use a generic icon, can be customized per subcategory later
      }));

    return [...baseNavigation, ...subcatNavigation];
  };

  const mainNavigation = getDynamicNavigation();

  const bottomNavigation = [
    { name: "Training", href: "/dashboard", icon: Home },
    { name: "Social", href: "/social", icon: Users },
    { name: "AI Coach", href: "/ai-coach", icon: Target },
    { name: "Achievements", href: "/achievements", icon: Award },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex h-14 items-center px-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-xl font-bold text-primary">iTrack.iWin.</h2>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex-1 p-4">
                  <ul className="space-y-2">
                    {mainNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.name}>
                          <Link
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                              isActive(item.href)
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  
                  <div className="mt-8">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Other
                    </h3>
                    <ul className="space-y-2">
                      {[
                        { name: "Progress", href: "/progress", icon: TrendingUp },
                        { name: "Insights", href: "/insights", icon: Target },
                        { name: "Analytics", href: "/analytics", icon: Award },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                                isActive(item.href)
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </nav>
                <div className="border-t p-4">
                  <div className="flex items-center justify-between">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <div className="flex-1 flex justify-center">
            <h1 className="text-3xl font-bold text-primary">iTrack.iWin.</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Bell className="h-4 w-4" />
            </Button>
            <ProfileAvatarMenu />
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-card border-r overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h2 className="text-2xl font-bold text-primary">iTrack.iWin.</h2>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {mainNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "group flex items-center px-2 py-2 text-sm rounded-md transition-colors",
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
              
              <div className="pt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  Other
                </h3>
                {[
                  { name: "Progress", href: "/progress", icon: TrendingUp },
                  { name: "Insights", href: "/insights", icon: Target },
                  { name: "Analytics", href: "/analytics", icon: Award },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm rounded-md transition-colors",
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:pl-64">
        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
        <nav className="flex justify-around py-2">
          {bottomNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors min-w-0",
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-xs truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default MobileLayout;