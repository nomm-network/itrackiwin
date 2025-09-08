import UnderConstruction from "../common/UnderConstruction";

export default function MealLogView(){
  const tips = [
    "Log as you go, not at day's end — real-time logging improves accuracy and habit stickiness.",
    "Capture portion estimates (cups/grams/hand sizes) and add photos when unsure; photos boost recall later.",
    "Track context that affects intake (hunger 1–10, mood, social setting). Consistency beats perfection.",
    "Aim for whole foods most of the time: veggies, fruits, legumes, whole grains, nuts, seeds; limit ultra-processed foods.",
    "Note beverages (especially alcohol/sugary drinks) — they're easy to forget and add up.",
    "Pre-log tricky moments (parties, travel) to set intentions in advance.",
    "Don't chase 'perfect days'; focus on streaks and trends. Small misses are data, not failure.",
    "Include protein in each meal to support satiety and muscle maintenance.",
    "Use simple tags like 'meal prep', 'dine-out', 'late-night' to spot patterns quickly.",
    "Review the week, not the day — adjust one lever at a time (snacks, portions, sugary drinks)."
  ];
  return (
    <>
      <h1>Nutrition</h1>
      <div className="kpi-row">
        <div className="kpi">Avg Protein/day</div>
        <div className="kpi">Fiber/day</div>
        <div className="kpi">Water Intake</div>
        <div className="kpi">Meals Logged (7d)</div>
      </div>
      <div className="card">Weekly Macro Trends — Coming soon</div>
      <UnderConstruction title="Nutrition · Meal Log" tips={tips} />
    </>
  );
}