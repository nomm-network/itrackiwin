import UnderConstruction from "../common/UnderConstruction";

export default function RecipesView(){
  const tips = [
    "Build meals around plants + protein + fiber + healthy fat (e.g., grain bowl with legumes, veggies, olive oil).",
    "Keep a staples list: canned beans, whole grains, frozen veg, eggs, yogurt, olive oil, nuts.",
    "Default to Mediterranean-style recipes for taste + evidence-backed health benefits.",
    "Batch-cook proteins and grains to assemble fast meals all week.",
    "Use herbs, spices, citrus to boost flavor without excess salt/sugar.",
    "Plan no-cook backups (tinned fish + beans + veggies; yogurt + fruit + nuts).",
    "Aim for colorful plates — diversity of plants correlates with nutrient diversity.",
    "Prefer whole, minimally processed ingredients; limit ultra-processed items.",
    "Make breakfast protein-forward (eggs, yogurt, cottage cheese, legumes).",
    "Keep a small rotation of go-to recipes for busy days; Mediterranean options are abundant."
  ];
  return (
    <>
      <h1>Nutrition</h1>
      <div className="kpi-row">
        <div className="kpi">Recipes Saved</div>
        <div className="kpi">New this week</div>
        <div className="kpi">Avg Prep Time</div>
        <div className="kpi">Favorites</div>
      </div>
      <div className="card">Recipe Ideas — Coming soon</div>
      <UnderConstruction title="Nutrition · Recipes" tips={tips} />
    </>
  );
}