import UnderConstruction from "../common/UnderConstruction";

export default function SleepLogView(){
  const tips = [
    "Log bedtime, wake time, sleep latency, awakenings each day to see patterns.",
    "Add caffeine/alcohol/meds/workouts to understand their impact.",
    "Track perceived quality (1–10) and daytime energy to connect habits with outcomes.",
    "Correlate logs with light exposure (morning sunlight helps circadian rhythm).",
    "Set a bedtime alarm (not just a wake alarm) to trigger wind-down.",
    "Keep naps <30 minutes and before mid-afternoon.",
    "On poor nights, avoid over-compensation (late sleep-ins) that disrupt rhythm.",
    "Review weekly averages; adjust one variable at a time (bedtime, caffeine cutoff).",
    "If snoring, witnessed apneas, or excessive sleepiness → seek evaluation for sleep disorders.",
    "Share a snapshot with your provider if concerns persist."
  ];
  return (
    <>
      <h1>Sleep</h1>
      <div className="kpi-row">
        <div className="kpi">Logs Recorded</div>
        <div className="kpi">Avg Bedtime</div>
        <div className="kpi">Avg Wake Time</div>
        <div className="kpi">Sleep Efficiency</div>
      </div>
      <div className="card">Sleep Log Entries — Coming soon</div>
      <UnderConstruction title="Sleep · Log" tips={tips} />
    </>
  );
}