// Pure function: NO network; feed it what it needs.
export type Unit = 'kg'|'lb';
export type LoadType = 'dual_load'|'single_load'|'stack'|'fixed'|'bodyweight'|'band';

export interface PlateProfile {
  unit: Unit;                // gym or equipment unit
  barWeight: number;         // e.g., 20 (kg) or 45 (lb)
  perSidePlates: number[];   // e.g., [25,20,15,10,5,2.5,1.25]
  microPlates?: number[];    // e.g., [1.0,0.5] etc.
  stackSteps?: number[];     // for stacks, e.g., [5,10,15,...]
  stackAddOns?: number[];    // small magnets/pins, e.g., [1.25,2.5]
  dumbbellSet?: number[];    // fixed DBs available, e.g., [2.5,5,7.5,...]
  fixedBars?: number[];      // straight/EZ fixed bars available
}

export interface ResolveParams {
  desired: number;           // target weight (user unit)
  userUnit: Unit;            // user UI unit
  loadType: LoadType;
  profile: PlateProfile;     // gym/equipment specific offer
}

export interface ResolveResult {
  targetDisplay: number;     // snapped, in user unit
  machineDisplay?: number;   // if stack, the stack notch amount in profile.unit
  totalSystemWeight: number; // actual total (bar + plates); user unit
  perSidePlates?: number[];  // barbell breakdown, in profile.unit
  usedAddOns?: number[];     // microplates or stack add-ons in profile.unit
  matchQuality: 'exact'|'nearestUp'|'nearestDown';
}

export function resolveLoadout(p: ResolveParams): ResolveResult {
  // 1) normalize desired into profile.unit
  const toProfile = (val: number) => p.userUnit === p.profile.unit ? val : (p.userUnit === 'kg' ? val * 2.20462262 : val / 2.20462262);
  const toUser = (val: number) => p.userUnit === p.profile.unit ? val : (p.userUnit === 'kg' ? val / 2.20462262 : val * 2.20462262);

  const desiredProfile = toProfile(p.desired);

  // 2) route by load type
  if (p.loadType === 'stack') {
    const steps = p.profile.stackSteps ?? [];
    const addons = p.profile.stackAddOns ?? [];
    // try step and step+addon combos; pick nearest to desiredProfile
    let best = { w: Infinity, base: 0, add: 0 };
    
    for (const s of steps) {
      const d0 = Math.abs(s - desiredProfile);
      if (d0 < Math.abs(best.w - desiredProfile)) best = { w: s, base: s, add: 0 };
      
      for (const a of addons) {
        const cand = s + a;
        if (Math.abs(cand - desiredProfile) < Math.abs(best.w - desiredProfile)) {
          best = { w: cand, base: s, add: a };
        }
      }
    }
    
    const machineDisplay = best.base;
    const usedAddOns = best.add ? [best.add] : [];
    
    return {
      targetDisplay: Math.round(toUser(best.w) * 10) / 10,
      machineDisplay,
      totalSystemWeight: Math.round(toUser(best.w) * 10) / 10,
      usedAddOns,
      matchQuality: Math.abs(best.w - desiredProfile) < 1e-6 ? 'exact' : (best.w > desiredProfile ? 'nearestUp' : 'nearestDown'),
    };
  }

  if (p.loadType === 'fixed') {
    // pick closest from fixed bars or dumbbells
    const options = (p.profile.fixedBars && p.profile.fixedBars.length ? p.profile.fixedBars : p.profile.dumbbellSet) ?? [];
    let best = options[0] ?? 0;
    
    for (const w of options) {
      if (Math.abs(w - desiredProfile) < Math.abs(best - desiredProfile)) best = w;
    }
    
    return {
      targetDisplay: Math.round(toUser(best) * 10) / 10,
      totalSystemWeight: Math.round(toUser(best) * 10) / 10,
      matchQuality: Math.abs(best - desiredProfile) < 1e-6 ? 'exact' : (best > desiredProfile ? 'nearestUp' : 'nearestDown'),
    };
  }

  // dual_load / single_load
  const bar = p.profile.barWeight ?? 0;
  const plates = (p.profile.perSidePlates ?? []).slice().sort((a, b) => b - a);
  const micros = (p.profile.microPlates ?? []).slice().sort((a, b) => b - a);

  const needTotal = Math.max(desiredProfile, bar); // never below bar
  let best = { total: bar, perSide: [] as number[], addOns: [] as number[] };

  // greedy-ish search: fill per side from largest to smallest, then try micros
  const perSideTarget = Math.max((needTotal - bar) / (p.loadType === 'dual_load' ? 2 : 1), 0);

  function fill(sideTarget: number) {
    const side: number[] = [];
    let rem = sideTarget;
    
    for (const w of plates) {
      while (rem >= w - 1e-6) {
        side.push(w);
        rem -= w;
      }
    }
    
    for (const m of micros) {
      while (rem >= m - 1e-6) {
        side.push(m);
        rem -= m;
      }
    }
    
    const built = (p.loadType === 'dual_load' ? side.reduce((a, b) => a + b, 0) * 2 : side.reduce((a, b) => a + b, 0)) + bar;
    return { side, total: built, rem };
  }

  const attempt = fill(perSideTarget);
  best = { total: attempt.total, perSide: attempt.side, addOns: [] };

  const result: ResolveResult = {
    targetDisplay: Math.round(toUser(best.total) * 10) / 10,
    totalSystemWeight: Math.round(toUser(best.total) * 10) / 10,
    perSidePlates: p.loadType === 'dual_load' ? best.perSide : undefined,
    usedAddOns: undefined,
    matchQuality: Math.abs(best.total - desiredProfile) < 1e-6 ? 'exact' : (best.total > desiredProfile ? 'nearestUp' : 'nearestDown'),
  };
  
  return result;
}