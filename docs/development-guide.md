# Weight Resolution System - Development Guide

## Getting Started

### Prerequisites
- React 18+ with TypeScript
- Supabase project with authentication
- TanStack Query for data fetching

### Installation
No additional packages required - uses existing project dependencies.

### Initial Setup

1. **Run Database Migrations**
   ```sql
   -- Migrations already applied:
   -- 20250911100816_dbf0ee8a-32c7-41d6-8fcf-98df1e409574.sql (Step 10)
   -- 20250911101245_f8c4b5d9-8e3a-4c2b-9f7e-123456789abc.sql (Step 7)
   ```

2. **Enable Feature Flags**
   ```sql
   INSERT INTO app_flags (key, enabled) VALUES ('gym_equipment_v2', true);
   ```

3. **Configure Gym Equipment**
   Use the `MixedUnitInventoryDisplay` component in your gym admin interface.

---

## Development Patterns

### Weight Conversion
Always use the canonical conversion utilities:

```typescript
// ✅ CORRECT
import { toKg, toDisplayUnit } from '@/lib/equipment/mixedUnits';

const storeWeight = toKg(inputWeight, inputUnit); // Always store as kg
const displayWeight = toDisplayUnit(storedKg, userUnit); // Convert for display

// ❌ INCORRECT
const stored = inputUnit === 'kg' ? weight : weight * 0.4536; // Manual conversion
```

### Data Flow Pattern
Follow the canonical storage pattern:

```
Input (any unit) → toKg() → Database (kg) → toDisplayUnit() → UI (user preference)
```

### Feature Flag Usage
Always wrap new functionality in feature flags:

```typescript
const useNewResolution = async () => {
  const enabled = await getFeatureFlag('gym_equipment_v2');
  if (enabled) {
    return await resolveAchievableLoadV2(params);
  }
  return await resolveAchievableLoadV1(params);
};
```

### Error Handling
Implement graceful degradation:

```typescript
try {
  const result = await resolveWithNewSystem(params);
  await logWeightResolution(result); // Track success
  return result;
} catch (error) {
  console.error('New system failed, falling back:', error);
  return await resolveWithFallback(params);
}
```

---

## Component Development

### Mixed Unit Display
For workout screens, always show conversion hints:

```typescript
// In workout components
<MixedUnitWeightDisplay 
  weight={targetWeight}
  nativeUnit={equipmentUnit}
  displayUnit={userPreference}
  showConversionHint={true}
/>
```

### Admin Interfaces
For gym management, show native + converted:

```typescript
// In admin components
<MixedUnitInventoryDisplay 
  gymId={currentGym.id}
  onAddItem={(type) => openAddModal(type)}
/>
```

### Feature Flag Indicators
During development, show flag status:

```typescript
// In development builds
{process.env.NODE_ENV === 'development' && (
  <FeatureFlagIndicator flagKey="gym_equipment_v2" />
)}
```

---

## Testing Strategies

### Unit Tests
Test core conversion logic:

```typescript
describe('Mixed Unit Conversions', () => {
  test('round-trip accuracy', () => {
    const original = 45;
    const kg = toKg(original, 'lb');
    const backToLb = toDisplayUnit(kg, 'lb');
    expect(Math.abs(original - backToLb)).toBeLessThan(0.1);
  });
});
```

### Integration Tests
Test the full resolution flow:

```typescript
describe('Weight Resolution', () => {
  test('mixed inventory resolution', async () => {
    const gymId = await createTestGym();
    await addMixedInventory(gymId);
    
    const result = await resolveAchievableLoad(exerciseId, 100, gymId);
    expect(result.achievable).toBe(true);
    expect(result.source).toBe('gym');
  });
});
```

### Manual Testing Checklist
- [ ] Add kg plates to gym inventory
- [ ] Add lb plates to same gym
- [ ] Verify minimum increment calculation
- [ ] Test weight resolution across units
- [ ] Check conversion hint display
- [ ] Validate admin native/converted columns

---

## Performance Optimization

### Caching Strategy
Use appropriate cache durations:

```typescript
// Equipment rarely changes
const { data } = useQuery({
  queryKey: ['gym-inventory', gymId],
  queryFn: fetchInventory,
  staleTime: 10 * 60 * 1000, // 10 minutes
});

// Feature flags change infrequently
const { data } = useQuery({
  queryKey: ['feature-flag', flagKey],
  queryFn: getFeatureFlag,
  staleTime: 30 * 60 * 1000, // 30 minutes
});
```

### Batch Operations
Combine related queries:

```typescript
// ✅ CORRECT - Parallel fetching
const [plates, dumbbells, flags] = await Promise.all([
  fetchPlates(gymId),
  fetchDumbbells(gymId),
  getFeatureFlag('gym_equipment_v2')
]);

// ❌ INCORRECT - Sequential fetching
const plates = await fetchPlates(gymId);
const dumbbells = await fetchDumbbells(gymId);
const flags = await getFeatureFlag('gym_equipment_v2');
```

### Database Optimization
Use indexes for common queries:

```sql
-- Already created in migrations
CREATE INDEX idx_plates_mixed_unit_lookup ON user_gym_plates(user_gym_id, native_unit, weight);
CREATE INDEX idx_weight_resolution_log_user_exercise ON weight_resolution_log(user_id, exercise_id, created_at);
```

---

## Debugging Guide

### Common Issues

**Issue**: Conversion hints not showing
```typescript
// Check unit context
const context = { exerciseUnit, userUnit, gymUnit };
const displayUnit = getDisplayUnit(context);
console.log('Display unit:', displayUnit, 'Native unit:', nativeUnit);
```

**Issue**: Incorrect weight increments
```typescript
// Verify mixed inventory
const { data: inventory } = useMixedUnitGymInventory(gymId);
console.log('Available weights:', inventory.map(i => `${i.native_weight} ${i.native_unit}`));
```

**Issue**: Feature flag not working
```typescript
// Check flag status
const enabled = await getFeatureFlag('gym_equipment_v2');
console.log('Feature flag enabled:', enabled);
```

### Development Tools

**Feature Flag Monitor**:
```typescript
<FeatureFlagIndicator flagKey="gym_equipment_v2" />
```

**Weight Resolution Logger**:
```typescript
// Automatic logging in resolveLoad.ts
// Check database: SELECT * FROM weight_resolution_log ORDER BY created_at DESC;
```

**Conversion Validator**:
```typescript
const isValid = validateMixedUnitRoundTrip(45, 'lb', 'kg', 0.1);
console.log('Conversion valid:', isValid);
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All migrations applied successfully
- [ ] Feature flags configured appropriately
- [ ] Performance tests pass
- [ ] Error handling tested
- [ ] Rollback plan verified

### Production Deployment
- [ ] Deploy with feature flag disabled initially
- [ ] Monitor baseline metrics
- [ ] Enable feature flag for small percentage
- [ ] Monitor resolution accuracy and performance
- [ ] Gradually increase rollout percentage

### Post-Deployment
- [ ] Monitor `weight_resolution_log` for issues
- [ ] Check error rates in application logs
- [ ] Validate user feedback
- [ ] Document any configuration changes

---

## Future Enhancements

### Planned Features (Steps 8-9)
- Load pattern templates (linear, wave, block periodization)
- Performance-based auto-adjustments
- Enhanced analytics and reporting

### Extension Points
- Custom loading algorithms per gym
- Equipment-specific resolution logic
- Advanced readiness integration
- Machine learning for weight suggestions

---

*Development Guide v1.2*
*Last Updated: 2025-01-11*