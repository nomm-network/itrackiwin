import UnderConstruction from "../common/UnderConstruction";

export default function SleepOverviewView(){
  const tips = [
    "Keep a consistent sleep/wake schedule, even on weekends.",
    "Create a wind-down routine (lights down, screens off, relaxing activity) 30–60 min before bed.",
    "Optimize your sleep environment: cool, dark, quiet, comfortable mattress/pillow.",
    "Limit caffeine after mid-afternoon and alcohol close to bedtime.",
    "Get daytime light exposure and move your body regularly.",
    "Reserve the bed for sleep and intimacy — avoid work/scrolling in bed.",
    "If you can't sleep after ~20 minutes, get up and do something relaxing; try again when sleepy.",
    "Track key patterns (bedtime, wakings, naps, caffeine, meds) to spot trends.",
    "Avoid long late naps (keep naps short and earlier in the day).",
    "If sleep issues persist, talk to a clinician; sleep hygiene isn't a cure-all."
  ];
  return (
    <>
      <h1>Sleep</h1>
      <div className="kpi-row">
        <div className="kpi">Avg Sleep (7d)</div>
        <div className="kpi">Consistency</div>
        <div className="kpi">Sleep Quality</div>
        <div className="kpi">Caffeine Cutoff</div>
      </div>
      <div className="card">Sleep Timeline — Coming soon</div>
      <UnderConstruction title="Sleep · Overview" tips={tips} />
    </>
  );
}