import { supabase } from '@/integrations/supabase/client';
import { getEquipmentRefId } from '@/lib/workouts/equipmentContext';

const BAR_CACHE = new Map<string, number>();

export async function getBarWeightKg(exLike: any): Promise<number> {
  const eqId = getEquipmentRefId(exLike);
  if (!eqId) return 0;

  if (BAR_CACHE.has(eqId)) return BAR_CACHE.get(eqId)!;

  const { data, error } = await supabase
    .from('equipment')
    .select('id, slug, default_bar_weight_kg, equipment_type, load_type')
    .eq('id', eqId)
    .maybeSingle();

  if (error || !data) return 0;

  // Convention: barbells have default_bar_weight_kg, others 0
  const w = Number(data.default_bar_weight_kg ?? 0);
  BAR_CACHE.set(eqId, w);
  return w;
}

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