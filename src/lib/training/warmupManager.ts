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
  ctx.primedPrimary.set(primaryGroup, (ctx.primedPrimary.get(primaryGroup) ?? 0) + 1);
  secondaryGroups.forEach(g => ctx.touchedSecondary.add(g));
}

export function recommendedWarmupsFor(
  primaryGroup: GroupId,
  secondaryGroups: GroupId[] = [],
): number {
  const primaryCount = ctx.primedPrimary.get(primaryGroup) ?? 0;

  if (primaryCount >= 2) return 1;     // 3rd+ exercise in same primary
  if (primaryCount === 1) return 2;    // 2nd exercise in same primary

  // first exercise in this primary:
  if (ctx.touchedSecondary.has(primaryGroup)) {
    return 2; // was a secondary group before → needs less
  }
  return 3;   // cold start
}