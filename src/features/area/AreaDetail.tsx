import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppStore } from "@/store/app";
import { AreaId } from "@/types/domain";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HabitItem from "@/components/HabitItem";
import MetricChart from "@/components/MetricChart";

const AreaDetail: React.FC = () => {
  const { slug } = useParams<{ slug: AreaId }>();
  const seedIfEmpty = useAppStore((s) => s.seedIfEmpty);
  const area = useAppStore((s) => (slug ? s.areas[slug] : undefined));
  const habits = useAppStore((s) => s.habits.filter((h) => h.area_id === slug));
  const addHabit = useAppStore((s) => s.addHabit);
  const logHabitCompletion = useAppStore((s) => s.logHabitCompletion);
  const getStreakForArea = useAppStore((s) => s.getStreakForArea);
  const addMetricEntry = useAppStore((s) => s.addMetricEntry);
  const [habitTitle, setHabitTitle] = useState("");
  const streak = useMemo(() => (slug ? getStreakForArea(slug) : 0), [getStreakForArea, slug]);

  React.useEffect(() => seedIfEmpty(), [seedIfEmpty]);

  if (!slug || !area) {
    return (
      <div className="container py-10">
        <p>Area not found. <Link className="story-link" to="/">Go back</Link></p>
      </div>
    );
  }

  const metricData = Array.from({ length: 14 }).map((_, i) => ({ x: String(i), y: Math.max(0, 8 + Math.sin(i / 2) * 3) }));

  return (
    <main className="container py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold" aria-live="polite">
          {area.icon} {area.name}
        </h1>
        <p className="text-muted-foreground">Current streak: {streak} day{streak === 1 ? "" : "s"}</p>
      </header>
      <Tabs defaultValue="habits" className="w-full">
        <TabsList>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="habits">Habits</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="reflections">Reflections</TabsTrigger>
        </TabsList>
        <TabsContent value="goals">
          <div className="text-sm text-muted-foreground">Goals coming soon.</div>
        </TabsContent>
        <TabsContent value="habits">
          <div className="space-y-4">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!habitTitle.trim()) return;
                addHabit({ title: habitTitle.trim(), user_id: "local", area_id: slug, cadence: {} });
                setHabitTitle("");
              }}
            >
              <Input value={habitTitle} onChange={(e) => setHabitTitle(e.target.value)} placeholder="Add a habit" aria-label="Add a habit" />
              <Button type="submit">Add</Button>
            </form>
            <div className="grid gap-3" role="list">
              {habits.map((h) => (
                <HabitItem key={h.id} title={h.title} onComplete={() => logHabitCompletion(h.id)} />
              ))}
              {habits.length === 0 && (
                <p className="text-sm text-muted-foreground">No habits yet. Create your first one above.</p>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="metrics">
          <div className="space-y-4">
            <MetricChart data={metricData} colorHsl={area.color} />
            <Button onClick={() => addMetricEntry({ metric_id: "demo", value: Math.random() * 10, recorded_at: new Date().toISOString() })}>
              Add Random Entry
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="reflections">
          <p className="text-sm text-muted-foreground">Write quick reflections in Journal. Area-specific reflections will appear here in the future.</p>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default AreaDetail;
