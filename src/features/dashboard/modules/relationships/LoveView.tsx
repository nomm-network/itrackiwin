import UnderConstruction from "../common/UnderConstruction";

export default function LoveView(){
  const tips = [
    "Maintain a high positive-to-negative interaction ratio (target ≈ 5:1 during conflict).",
    "Make bids for connection daily (check-ins, touch, shared humor) and turn toward your partner's bids.",
    "Replace criticism, contempt, defensiveness, stonewalling with curiosity and repair.",
    "Schedule stress-reducing conversations (listen, validate; no fixing unless asked).",
    "Keep a shared meaning: goals, rituals, narratives (why you're 'us').",
    "Apologize early, repair often; small repairs prevent big ruptures.",
    "Nurture friendship inside the romance (admiration, curiosity, play).",
    "Align money, chores, intimacy, tech expectations explicitly; don't rely on mind-reading.",
    "Practice self-soothing before hot topics; take breaks to avoid flooding.",
    "Remember: no relationship is 'perfect' — growth beats perfectionism."
  ];
  return (
    <>
      <h1>Relationships</h1>
      <div className="kpi-row">
        <div className="kpi">Date Nights</div>
        <div className="kpi">Check-ins</div>
        <div className="kpi">Positivity Ratio</div>
        <div className="kpi">Shared Goals</div>
      </div>
      <div className="card">Love Timeline — Coming soon</div>
      <UnderConstruction title="Relationships · Love" tips={tips} />
    </>
  );
}