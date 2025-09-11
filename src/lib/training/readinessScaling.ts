// 0–100 readiness in → {weightPct, repsDelta}
export function scaleByReadiness(score: number) {
  const s = Math.max(0, Math.min(100, Math.round(score || 0)));

  console.log('🎯 DEBUG: scaleByReadiness - Input processing:', {
    originalScore: score,
    clampedScore: s,
    clampingApplied: score !== s
  });

  // piecewise model: conservative near the middle, harsher at the bottom,
  // a little reward at the top. WeightPct multiplies the baseline target weight.
  let result;
  
  if (s < 15) {
    result = { weightPct: 0.90, repsDelta: -2 };   // very low → pull back
    console.log('🎯 DEBUG: scaleByReadiness - Very low readiness bracket (<15):', result);
  } else if (s < 25) {
    result = { weightPct: 0.94, repsDelta: -1 };
    console.log('🎯 DEBUG: scaleByReadiness - Low readiness bracket (<25):', result);
  } else if (s < 40) {
    result = { weightPct: 0.98, repsDelta:  0 };
    console.log('🎯 DEBUG: scaleByReadiness - Below average bracket (<40):', result);
  } else if (s < 60) {
    result = { weightPct: 1.00, repsDelta:  0 };
    console.log('🎯 DEBUG: scaleByReadiness - Average bracket (<60):', result);
  } else if (s < 75) {
    result = { weightPct: 1.02, repsDelta: +0 };   // mild reward
    console.log('🎯 DEBUG: scaleByReadiness - Above average bracket (<75):', result);
  } else if (s < 90) {
    result = { weightPct: 1.03, repsDelta: +1 };
    console.log('🎯 DEBUG: scaleByReadiness - High readiness bracket (<90):', result);
  } else {
    result = { weightPct: 1.05, repsDelta: +1 };       // elite day
    console.log('🎯 DEBUG: scaleByReadiness - Elite readiness bracket (>=90):', result);
  }
  
  console.log('🎯 DEBUG: scaleByReadiness - Final result:', {
    inputScore: score,
    clampedScore: s,
    outputWeightPct: result.weightPct,
    outputRepsDelta: result.repsDelta,
    bracket: s < 15 ? 'very-low' : s < 25 ? 'low' : s < 40 ? 'below-avg' : s < 60 ? 'average' : s < 75 ? 'above-avg' : s < 90 ? 'high' : 'elite'
  });
  
  return result;
}