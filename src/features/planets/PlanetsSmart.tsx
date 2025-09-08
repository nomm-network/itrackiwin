export default function PlanetsSmart() {
  // Try your real Orbit page first (rename/move your current orbit page to one of these)
  try { return require("@/features/planets/OrbitPlanetsPage").default(); } catch {}
  try { return require("@/features/planets/PlanetsPage").default(); } catch {}
  try { return require("@/features/discover/planets/OrbitView").default(); } catch {}

  // Visible fallback (no 404)
  return (
    <div style={{padding:16}}>
      <h1>Planets Hub</h1>
      <p>Orbit screen not found. Place it at one of:</p>
      <ul style={{opacity:.8}}>
        <li><code>features/planets/OrbitPlanetsPage.tsx</code></li>
        <li><code>features/planets/PlanetsPage.tsx</code></li>
        <li><code>features/discover/planets/OrbitView.tsx</code></li>
      </ul>
    </div>
  );
}