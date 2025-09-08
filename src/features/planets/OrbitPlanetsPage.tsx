import { useNavigate } from "react-router-dom";

type Target = { cat: string; sub: string; label: string };

const TARGETS: Target[] = [
  { cat: "health",        sub: "fitness-exercise",      label: "Fitness & exercise" },
  { cat: "health",        sub: "nutrition-hydration",   label: "Nutrition & hydration" },
  { cat: "health",        sub: "sleep-quality",         label: "Sleep" },
  { cat: "wealth",        sub: "saving-investing",      label: "Saving & investing" },
  { cat: "relationships", sub: "romantic-life",         label: "Romantic life" },
  // …add more planets as you expose them
];

export default function OrbitPlanetsPage() {
  const nav = useNavigate();
  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-2">Planets Hub</h1>
      <p className="text-muted-foreground mb-4">
        Tap a planet to jump to its dashboard.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {TARGETS.map((t) => (
          <button
            key={`${t.cat}:${t.sub}`}
            className="btn btn-secondary"
            onClick={() => nav(`/dashboard?cat=${t.cat}&sub=${t.sub}`)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}