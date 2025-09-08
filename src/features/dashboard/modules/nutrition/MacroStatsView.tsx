import UnderConstruction from "../common/UnderConstruction";

export default function MacroStatsView(){
  const tips = [
    "Prioritize overall pattern quality over micromanaging macros; think Mediterranean-style: plants, olive oil, fish, legumes.",
    "Set a protein floor (≥0.8 g/kg/day; athletes often higher) and distribute across meals.",
    "Choose high-fiber carbs (whole grains, beans, fruit) to stabilize energy and appetite.",
    "Favor unsaturated fats (olive oil, nuts, fish) and limit trans/processed fats.",
    "Watch added sugars — especially in drinks, sauces, and desserts.",
    "Use weekly averages, not daily perfection, to judge macro alignment.",
    "If weight goals stall, adjust one macro lever (usually carbs or total calories) by a small amount and test for 1–2 weeks.",
    "Pair carbs with protein/fat for better satiety and glycemic control.",
    "Keep hydration in check; thirst often masks as hunger.",
    "Use evidence-based patterns (Mediterranean) as your default; it's well-supported for heart and metabolic health."
  ];
  return (
    <>
      <h1>Nutrition</h1>
      <div className="kpi-row">
        <div className="kpi">Protein %</div>
        <div className="kpi">Carbs %</div>
        <div className="kpi">Fats %</div>
        <div className="kpi">Calories/day</div>
      </div>
      <div className="card">Macro Breakdown Chart — Coming soon</div>
      <UnderConstruction title="Nutrition · Macro Stats" tips={tips} />
    </>
  );
}