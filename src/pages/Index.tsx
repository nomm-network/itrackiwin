import React from "react";
import Humanoid, { AreaId } from "@/components/Humanoid";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/app";
import { Button } from "@/components/ui/button";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const seedIfEmpty = useAppStore((s) => s.seedIfEmpty);
  const areas = useAppStore((s) => s.areas);

  React.useEffect(() => seedIfEmpty(), [seedIfEmpty]);

  const onSelect = (id: AreaId) => {
    navigate(`/area/${id}`);
  };

  return (
    <main className="min-h-screen bg-[hsl(215_25%_7%)]">
      <header className="container py-8">
        <nav className="flex items-center justify-between">
          <a href="#main" className="sr-only focus:not-sr-only">Skip to content</a>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">I Track I Win</span>
            <span className="text-sm text-muted-foreground">Track what matters. Win your life.</span>
          </div>
          <div className="hidden md:flex gap-4 text-sm">
            <Link className="story-link" to="/progress">Progress</Link>
            <Link className="story-link" to="/journal">Journal</Link>
            <Link className="story-link" to="/insights">Insights</Link>
            <Link className="story-link" to="/profile">Profile</Link>
          </div>
        </nav>
      </header>
      <section id="main" className="container grid md:grid-cols-2 gap-10 items-center py-6">
        <div className="order-2 md:order-1 space-y-6 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">I Track I Win</h1>
          <p className="text-muted-foreground max-w-prose">
            Tap the humanoid hotspots to jump into life areas. Build habits, keep streaks, visualize progress.
          </p>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/journal')} className="hover-scale">Daily Check-in</Button>
            <Button variant="secondary" onClick={() => navigate('/progress')}>View Progress</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4" aria-label="Areas">
            {Object.values(areas).map((a) => (
              <button
                key={a.id}
                onClick={() => navigate(`/area/${a.slug}`)}
                className="rounded-lg border bg-card p-4 text-left hover-scale focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label={`${a.name} area`}
              >
                <div className="text-2xl" aria-hidden>{a.icon}</div>
                <div className="font-medium">{a.name}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="order-1 md:order-2">
          <Humanoid onSelectArea={onSelect} />
        </div>
      </section>
      <footer className="container py-8 text-xs text-muted-foreground">
        <p>Privacy-first. All data stays yours. Web companion prototype — mobile app coming via React Native/Expo.</p>
      </footer>
    </main>
  );
};

export default Index;
