export function getBarMeta(equipmentRef?: string | null) {
  if (!equipmentRef) return { hasBar: false, barKg: 0 };
  if (equipmentRef === 'barbell_standard') return { hasBar: true, barKg: 20 };
  if (equipmentRef === 'barbell_ez') return { hasBar: true, barKg: 7.5 };
  if (equipmentRef === 'barbell_olympic') return { hasBar: true, barKg: 20 };
  if (equipmentRef === 'barbell_safety') return { hasBar: true, barKg: 15 };
  // selectorized/machine dual-arm: no bar
  return { hasBar: false, barKg: 0 };
}