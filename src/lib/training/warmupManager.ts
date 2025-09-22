export type GroupId = string;

type WarmContext = {
  primedPrimary: Map<GroupId, number>;    // count of *working* sets done this session
  touchedSecondary: Set<GroupId>;         // groups hit as secondary
};

const ctx: WarmContext = {
  primedPrimary: new Map(),
  touchedSecondary: new Set(),
};

export function resetWarmupContext() {
  ctx.primedPrimary.clear();
  ctx.touchedSecondary.clear();
}

export function noteWorkingSet(primaryGroup: GroupId, secondaryGroups: GroupId[] = []) {
  console.log('💪 noteWorkingSet called:', { primaryGroup, secondaryGroups });
  ctx.primedPrimary.set(primaryGroup, (ctx.primedPrimary.get(primaryGroup) ?? 0) + 1);
  secondaryGroups.forEach(g => ctx.touchedSecondary.add(g));
  console.log('Updated context:', {
    primedPrimary: Object.fromEntries(ctx.primedPrimary),
    touchedSecondary: Array.from(ctx.touchedSecondary)
  });
}

export function recommendedWarmupsFor(
  primaryGroup: GroupId,
  secondaryGroups: GroupId[] = [],
): number {
  const primaryCount = ctx.primedPrimary.get(primaryGroup) ?? 0;

  console.log('🔥 recommendedWarmupsFor called:', {
    primaryGroup,
    secondaryGroups,
    primaryCount,
    touchedSecondary: Array.from(ctx.touchedSecondary),
    primedPrimary: Object.fromEntries(ctx.primedPrimary)
  });

  if (primaryCount >= 2) {
    console.log('→ Returning 1 set (3rd+ exercise)');
    return 1;     // 3rd+ exercise in same primary
  }
  if (primaryCount === 1) {
    console.log('→ Returning 2 sets (2nd exercise)');
    return 2;    // 2nd exercise in same primary
  }

  // first exercise in this primary:
  if (ctx.touchedSecondary.has(primaryGroup)) {
    console.log('→ Returning 2 sets (was secondary before)');
    return 2; // was a secondary group before → needs less
  }
  console.log('→ Returning 3 sets (cold start)');
  return 3;   // cold start
}