import React from "react";
import OrbitNavigation from "@/components/OrbitNavigation";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";
import { AreaId } from "@/types/domain";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useIsSuperAdmin } from "@/hooks/useIsSuperAdmin";
import { supabase } from "@/integrations/supabase/client";

const Orbits: React.FC = () => {
  const navigate = useNavigate();
  const { isSuperAdmin } = useIsSuperAdmin();
  const seedIfEmpty = useAppStore(s => s.seedIfEmpty);
  const areas = useAppStore(s => s.areas);
  const [session, setSession] = React.useState<any>(null);

  React.useEffect(() => {
    seedIfEmpty();
    
    // Check auth state
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
  }, [seedIfEmpty]);

  const onSelect = (id: AreaId) => {
    if (session?.user) {
      // Authenticated users go to dashboard with category filter
      if (id === "health") {
        navigate("/dashboard?cat=health&sub=fitness");
      } else {
        navigate(`/dashboard?cat=${id}`);
      }
    } else {
      // Unauthenticated users see area detail
      navigate(`/area/${id}`);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="container py-4 md:py-8">
        <nav className="flex items-center justify-between">
          <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
          <div className="flex items-center gap-2">
            <span className="text-lg md:text-xl font-bold">I Track. I Win.</span>
            <span className="hidden sm:block text-sm text-muted-foreground">Track what matters! Win your life!</span>
          </div>
          <div className="flex gap-2 md:gap-4 text-sm items-center">
            {session?.user ? (
              <div className="hidden md:flex gap-4 items-center">
                <Link className="story-link" to="/dashboard">Dashboard</Link>
                <Link className="story-link" to="/progress">Progress</Link>
                <Link className="story-link" to="/journal">Journal</Link>
                <Link className="story-link" to="/fitness">Fitness</Link>
                <Link className="story-link" to="/insights">Insights</Link>
                {isSuperAdmin && <Link className="story-link" to="/admin">Admin</Link>}
              </div>
            ) : (
              <div className="hidden md:flex gap-4 items-center">
                <Link className="story-link" to="/progress">Progress</Link>
                <Link className="story-link" to="/journal">Journal</Link>
                <Link className="story-link" to="/fitness">Fitness</Link>
                <Link className="story-link" to="/insights">Insights</Link>
              </div>
            )}
            <div className="md:hidden">
              <Button variant="outline" size="sm" asChild>
                <Link to={session?.user ? "/dashboard" : "/auth"}>
                  {session?.user ? "Dashboard" : "Sign In"}
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </nav>
      </header>
      <section id="main" className="container flex flex-col gap-6 md:gap-10 items-start py-4 md:py-6">
        <div className="space-y-4 md:space-y-6 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">I Track. I Win.</h1>
          <p className="text-muted-foreground max-w-prose text-sm md:text-base">
            Tap the orbiting planets to jump into life areas. Build habits, keep streaks, visualize progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            {session?.user ? (
              <>
                <Button onClick={() => navigate('/dashboard')} className="hover-scale w-full sm:w-auto">
                  Go to Dashboard
                </Button>
                <Button variant="secondary" onClick={() => navigate('/journal')} className="w-full sm:w-auto">
                  Daily Check-in
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/auth')} className="hover-scale w-full sm:w-auto">
                  Get Started
                </Button>
                <Button variant="secondary" onClick={() => navigate('/auth')} className="w-full sm:w-auto">
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="w-full">
          <OrbitNavigation centerImageSrc="/lovable-uploads/e7a0d714-f7f9-435b-9d3d-5cbdc1381b54.png" />
        </div>
      </section>
      <footer className="container py-8 text-xs text-muted-foreground">
        <p>Privacy-first. All data stays yours. Web companion prototype — mobile app coming via React Native/Expo.</p>
      </footer>
    </main>
  );
};

export default Orbits;