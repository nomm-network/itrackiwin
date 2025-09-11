import { LoadingContext, getCachedLoadingContext } from './resolveLoading';
import { fetchPlateItems, fetchDumbbells, fetchStackSteps, fetchBarWeight } from './fetchItems';
import { closestBarbellKg, closestDumbbellKg, closestStackKg, toKg, fromKg, calculateMinIncrement } from './closest';

export interface EquipmentResolvedWeight {
  weight: number;
  unit: string;
  achievable: boolean;
  breakdown?: {
    bar?: number;
    perSide?: number[];
    total?: number;
  };
  minIncrement: number;
}

export async function resolveWeightForExercise(
  targetWeight: number,
  targetUnit: 'kg' | 'lb',
  exerciseId?: string,
  loadType: 'dual_load' | 'single_load' | 'stack' = 'dual_load',
  userId?: string
): Promise<EquipmentResolvedWeight> {
  try {
    const context = await getCachedLoadingContext(userId);
    const targetKg = toKg(targetWeight, targetUnit);

    if (loadType === 'dual_load') {
      // Barbell exercise
      const plateItems = context.plateProfileId ? 
        await fetchPlateItems(context.plateProfileId) : [];
      const barKg = await fetchBarWeight(exerciseId, 'barbell');
      
      const plateSizesKg = plateItems.map(item => toKg(item.weight, item.unit as 'kg' | 'lb'));
      const countsPerSide = plateItems.map(item => item.count_per_side);
      
      const result = closestBarbellKg(targetKg, barKg, plateSizesKg, countsPerSide);
      const minIncrement = calculateMinIncrement('dual_load', plateSizesKg);
      
      return {
        weight: fromKg(result.totalKg, context.unit),
        unit: context.unit,
        achievable: Math.abs(result.residualKg) < 0.1,
        breakdown: {
          bar: fromKg(result.barKg, context.unit),
          perSide: result.perSide.map(p => fromKg(p, context.unit)),
          total: fromKg(result.totalKg, context.unit)
        },
        minIncrement: fromKg(minIncrement, context.unit)
      };
    } 
    else if (loadType === 'single_load') {
      // Dumbbell exercise
      const dumbbells = context.dumbbellProfileId ? 
        await fetchDumbbells(context.dumbbellProfileId) : [];
      
      const availableKg = dumbbells.map(db => toKg(db.weight, db.unit as 'kg' | 'lb'));
      const closestKg = closestDumbbellKg(targetKg, availableKg);
      const minIncrement = calculateMinIncrement('single_load', [], 2.5);
      
      return {
        weight: fromKg(closestKg, context.unit),
        unit: context.unit,
        achievable: availableKg.includes(closestKg),
        minIncrement: fromKg(minIncrement, context.unit)
      };
    }
    else if (loadType === 'stack') {
      // Stack/machine exercise
      const steps = context.stackProfileId ? 
        await fetchStackSteps(context.stackProfileId) : [];
      
      const stepKg = steps.map(s => toKg(s.step_weight, s.unit as 'kg' | 'lb'));
      const closestKg = closestStackKg(targetKg, stepKg);
      const minIncrement = calculateMinIncrement('stack', [], 2.5, 5);
      
      return {
        weight: fromKg(closestKg, context.unit),
        unit: context.unit,
        achievable: stepKg.includes(closestKg),
        minIncrement: fromKg(minIncrement, context.unit)
      };
    }

    // Fallback
    return {
      weight: targetWeight,
      unit: targetUnit,
      achievable: true,
      minIncrement: targetUnit === 'kg' ? 2.5 : 5
    };
  } catch (error) {
    console.error('Error resolving weight for exercise:', error);
    
    // Safe fallback
    return {
      weight: targetWeight,
      unit: targetUnit,
      achievable: true,
      minIncrement: targetUnit === 'kg' ? 2.5 : 5
    };
  }
}

export async function getAvailableWeights(
  loadType: 'dual_load' | 'single_load' | 'stack',
  exerciseId?: string,
  userId?: string,
  maxWeight: number = 200,
  unit: 'kg' | 'lb' = 'kg'
): Promise<number[]> {
  try {
    const context = await getCachedLoadingContext(userId);
    
    if (loadType === 'dual_load') {
      const plateItems = context.plateProfileId ? 
        await fetchPlateItems(context.plateProfileId) : [];
      const barKg = await fetchBarWeight(exerciseId, 'barbell');
      
      const plateSizesKg = plateItems.map(item => toKg(item.weight, item.unit as 'kg' | 'lb'));
      
      // Generate possible barbell weights up to maxWeight
      const weights = new Set<number>();
      weights.add(barKg); // Just the bar
      
      // Generate combinations (this is simplified - in practice you'd want to be more systematic)
      for (let total = barKg; total <= toKg(maxWeight, unit); total += 2.5) {
        const result = closestBarbellKg(total, barKg, plateSizesKg);
        if (Math.abs(result.residualKg) < 0.1) {
          weights.add(result.totalKg);
        }
      }
      
      return Array.from(weights)
        .map(w => fromKg(w, context.unit))
        .filter(w => w <= maxWeight)
        .sort((a, b) => a - b);
    }
    else if (loadType === 'single_load') {
      const dumbbells = context.dumbbellProfileId ? 
        await fetchDumbbells(context.dumbbellProfileId) : [];
      
      return dumbbells
        .map(db => fromKg(toKg(db.weight, db.unit as 'kg' | 'lb'), context.unit))
        .filter(w => w <= maxWeight)
        .sort((a, b) => a - b);
    }
    else if (loadType === 'stack') {
      const steps = context.stackProfileId ? 
        await fetchStackSteps(context.stackProfileId) : [];
      
      return steps
        .map(s => fromKg(toKg(s.step_weight, s.unit as 'kg' | 'lb'), context.unit))
        .filter(w => w <= maxWeight)
        .sort((a, b) => a - b);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting available weights:', error);
    return [];
  }
}