import UnderConstruction from "../common/UnderConstruction";

export default function FamilyView(){
  const tips = [
    "Hold regular family check-ins (agenda: wins, needs, plans).",
    "Model emotion coaching (name feelings, validate, guide).",
    "Establish clear roles & routines (chores, bedtime, devices).",
    "Use collaborative problem solving over punitive reactions.",
    "Practice respectful conflict (I-statements, no contempt/stonewalling).",
    "Protect family rituals (meals, walks, game night) to maintain cohesion.",
    "Align on values & boundaries; revisit as kids grow.",
    "When co-parenting, keep kids out of adult conflicts; communicate via shared plans.",
    "Seek third-party support (counselor/coach) when stuck; it's a strength, not failure.",
    "Document what works so you can repeat it during stressful seasons."
  ];
  return (
    <>
      <h1>Relationships</h1>
      <div className="kpi-row">
        <div className="kpi">Family Events</div>
        <div className="kpi">Shared Goals</div>
        <div className="kpi">Weekly Rituals</div>
        <div className="kpi">Conflicts Resolved</div>
      </div>
      <div className="card">Family Interactions — Coming soon</div>
      <UnderConstruction title="Relationships · Family" tips={tips} />
    </>
  );
}