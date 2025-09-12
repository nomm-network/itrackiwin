export function getDefaultBarKgBySlug(slug?: string | null) {
  if (!slug) return 20;                    // safe default
  if (slug.includes('ez')) return 7.5;
  if (slug.includes('trap') || slug.includes('hex')) return 25;
  if (slug.includes('technique')) return 10;
  return 20;                               // olympic barbell
}

export function toTotalKg(value: number, mode: 'per_side'|'total', includeBar: boolean, barKg = 20) {
  if (mode === 'per_side') return (value * 2) + (includeBar ? barKg : 0);
  return value;
}

export function toPerSideKg(total: number, includeBar: boolean, barKg = 20) {
  const minusBar = includeBar ? Math.max(0, total - barKg) : total;
  return minusBar / 2;
}