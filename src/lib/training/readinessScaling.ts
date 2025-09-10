// 0–100 readiness in → {weightPct, repsDelta}
export function scaleByReadiness(score: number) {
  const s = Math.max(0, Math.min(100, Math.round(score || 0)));

  // piecewise model: conservative near the middle, harsher at the bottom,
  // a little reward at the top. WeightPct multiplies the baseline target weight.
  if (s < 15)  return { weightPct: 0.90, repsDelta: -2 };   // very low → pull back
  if (s < 25)  return { weightPct: 0.94, repsDelta: -1 };
  if (s < 40)  return { weightPct: 0.98, repsDelta:  0 };
  if (s < 60)  return { weightPct: 1.00, repsDelta:  0 };
  if (s < 75)  return { weightPct: 1.02, repsDelta: +0 };   // mild reward
  if (s < 90)  return { weightPct: 1.03, repsDelta: +1 };
  return          { weightPct: 1.05, repsDelta: +1 };       // elite day
}