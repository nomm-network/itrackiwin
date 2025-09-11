type Unit = "kg" | "lb";

export function toKg(v: number, u: Unit): number { 
  return u === "kg" ? v : v * 0.45359237; 
}

export function fromKg(v: number, u: Unit): number { 
  return u === "kg" ? v : v / 0.45359237; 
}

export interface BarbellResult {
  totalKg: number;
  perSide: number[];
  barKg: number;
  residualKg: number;
}

// Barbell: bar weight + symmetric plates per side; greedily fill
export function closestBarbellKg(
  targetKg: number, 
  barKg: number, 
  plateSizesKg: number[], 
  countsPerSide: number[] = []
): BarbellResult {
  const perSideTarget = (targetKg - barKg) / 2;
  if (perSideTarget <= 0) {
    return { 
      totalKg: barKg, 
      perSide: [], 
      barKg, 
      residualKg: targetKg - barKg 
    };
  }

  // Create plate inventory with counts (default to unlimited if not specified)
  const sizes = plateSizesKg.map((w, i) => ({
    w, 
    count: countsPerSide[i] || 999 // Assume unlimited if not specified
  }));
  
  const perSide: number[] = [];
  let acc = 0;

  // Greedy algorithm: use largest plates first
  for (let i = 0; i < sizes.length; i++) {
    while (sizes[i].count > 0 && acc + sizes[i].w <= perSideTarget + 1e-9) {
      acc += sizes[i].w;
      sizes[i].count--;
      perSide.push(sizes[i].w);
    }
  }
  
  const total = barKg + 2 * acc;
  return { 
    totalKg: total, 
    perSide, 
    barKg, 
    residualKg: targetKg - total 
  };
}

// Dumbbell: pick the closest single dumbbell weight
export function closestDumbbellKg(targetKg: number, availableKg: number[]): number {
  if (!availableKg.length) return 0;
  
  let best = availableKg[0];
  let diff = Math.abs(availableKg[0] - targetKg);
  
  for (const w of availableKg) {
    const d = Math.abs(w - targetKg);
    if (d < diff) { 
      best = w; 
      diff = d; 
    }
  }
  return best;
}

// Stack: pick closest step, optionally plus aux micro-plates if provided
export function closestStackKg(
  targetKg: number, 
  stepsKg: number[], 
  auxKg: number[] = []
): number {
  if (!stepsKg.length) return 0;
  
  let best = stepsKg[0];
  let diff = Math.abs(stepsKg[0] - targetKg);
  
  for (const s of stepsKg) {
    const d = Math.abs(s - targetKg);
    if (d < diff) { 
      best = s; 
      diff = d; 
    }
    
    // Try with aux weights
    for (const a of auxKg) {
      const t = s + a;
      const da = Math.abs(t - targetKg);
      if (da < diff) { 
        best = t; 
        diff = da; 
      }
    }
  }
  return best;
}

// Calculate minimum weight increment for a given load type
export function calculateMinIncrement(
  loadType: 'dual_load' | 'single_load' | 'stack',
  plateSizesKg: number[] = [],
  dumbbellStepKg: number = 2.5,
  stackStepKg: number = 5
): number {
  switch (loadType) {
    case 'dual_load':
      // For barbells, minimum increment is 2x smallest plate (both sides)
      const minPlate = Math.min(...plateSizesKg.filter(x => x > 0));
      return isFinite(minPlate) ? minPlate * 2 : 2.5;
    case 'single_load':
      // For dumbbells, use the step between available weights
      return dumbbellStepKg;
    case 'stack':
      // For stacks, use the increment between selectable weights
      return stackStepKg;
    default:
      return 2.5;
  }
}