import React, { useMemo } from "react";
import MetricChart from "@/components/MetricChart";
import { useAppStore } from "@/store/app";

const Progress: React.FC = () => {
  const areas = useAppStore((s) => s.areas);
  const getStreakForArea = useAppStore((s) => s.getStreakForArea);

  const charts = useMemo(() =>
    Object.values(areas).map((a) => ({
      area: a,
      data: Array.from({ length: 14 }).map((_, i) => ({ x: `${i}`, y: Math.max(0, 8 + Math.sin((i + Math.random()) / 2) * 3) })),
    })), [areas]);

  return (
    <main className="container py-8">
      <h1 className="text-2xl font-semibold mb-6">Progress</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {charts.map(({ area, data }) => (
          <article key={area.id} className="rounded-lg border p-4 bg-card">
            <header className="mb-2 flex items-center justify-between">
              <h2 className="font-medium">{area.icon} {area.name}</h2>
              <span className="text-xs text-muted-foreground">Streak: {getStreakForArea(area.id)}d</span>
            </header>
            <MetricChart data={data} colorHsl={area.color} />
          </article>
        ))}
      </div>
    </main>
  );
};

export default Progress;
