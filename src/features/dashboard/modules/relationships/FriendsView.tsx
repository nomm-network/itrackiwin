import UnderConstruction from "../common/UnderConstruction";

export default function FriendsView(){
  const tips = [
    "Show up consistently — regular contact predicts friendship strength.",
    "Assume people like you (the 'liking gap' is real) to reduce social anxiety.",
    "Schedule standing rituals (weekly call, monthly coffee). Habits beat intentions.",
    "Practice active listening (reflect back, ask follow-ups).",
    "Offer low-friction help/support (a ride, an intro, a check-in text).",
    "Share small wins & struggles — mutual vulnerability builds closeness.",
    "Celebrate milestones and show up during setbacks; reliability matters.",
    "Keep score on positivity ratio; aim for many more positives than negatives.",
    "Apologize & repair quickly after missteps; don't let minor hurts fester.",
    "Periodically audit your calendar — friendships need time; book it."
  ];
  return (
    <>
      <h1>Relationships</h1>
      <div className="kpi-row">
        <div className="kpi">Connections/week</div>
        <div className="kpi">Check-ins</div>
        <div className="kpi">Quality score</div>
        <div className="kpi">Streak</div>
      </div>
      <div className="card">Recent Interactions — Coming soon</div>
      <UnderConstruction title="Relationships · Friends" tips={tips} />
    </>
  );
}