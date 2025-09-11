import { PlateProfile, WeightUnit } from './api';
import { roundWeight } from './convert';

export type LoadType = 'barbell' | 'ezbar' | 'fixed' | 'dumbbell' | 'stack';

// Generate valid weight increments for given equipment type
export const makeIncrementTable = (loadType: LoadType, profile: PlateProfile): number[] => {
  switch (loadType) {
    case 'barbell':
    case 'ezbar':
    case 'fixed': {
      const barWeight = loadType === 'barbell' ? profile.barbell_weight :
                       loadType === 'ezbar' ? profile.ezbar_weight :
                       profile.fixedbar_weight;
      
      // Generate all possible combinations: bar + 2*(side plates) + micro
      const increments = new Set<number>();
      
      // Start with just the bar
      increments.add(barWeight);
      
      // Add combinations with plates on both sides
      for (const side1 of profile.sides) {
        for (const side2 of profile.sides) {
          if (side2 >= side1) { // Only ascending combinations to avoid duplicates
            const plateWeight = side1 + side2;
            increments.add(barWeight + plateWeight);
            
            // Add micro variations
            for (const micro of profile.micro) {
              increments.add(barWeight + plateWeight + micro);
              increments.add(barWeight + plateWeight - micro);
            }
          }
        }
      }
      
      return Array.from(increments).filter(w => w > 0).sort((a, b) => a - b);
    }
    
    case 'dumbbell': {
      // For dumbbells, sides array represents available dumbbell weights
      return [...profile.sides].sort((a, b) => a - b);
    }
    
    case 'stack': {
      // For stacks, we need stack steps + aux adders
      // This would need stack profile data, simplified for now
      const increments = new Set<number>();
      
      // Assume 5kg/10lb steps for stacks
      const baseStep = profile.unit === 'kg' ? 5 : 10;
      for (let i = baseStep; i <= 200; i += baseStep) {
        increments.add(i);
        
        // Add micro variations
        for (const micro of profile.micro) {
          increments.add(i + micro);
        }
      }
      
      return Array.from(increments).sort((a, b) => a - b);
    }
    
    default:
      return [];
  }
};

// Find closest achievable weight
export const closestLoad = (desired: number, loadType: LoadType, profile: PlateProfile): number => {
  const increments = makeIncrementTable(loadType, profile);
  
  if (increments.length === 0) {
    return roundWeight(desired, profile.unit);
  }
  
  // Find closest increment
  let closest = increments[0];
  let minDiff = Math.abs(desired - closest);
  
  for (const increment of increments) {
    const diff = Math.abs(desired - increment);
    if (diff < minDiff) {
      minDiff = diff;
      closest = increment;
    }
  }
  
  return closest;
};

// Calculate plate loading for barbell exercises
export const formatPlateMath = (totalWeight: number, profile: PlateProfile): {
  leftSide: number[];
  rightSide: number[];
  microPlates: number[];
  barWeight: number;
  total: number;
} => {
  const barWeight = profile.barbell_weight;
  const remainingWeight = totalWeight - barWeight;
  
  if (remainingWeight <= 0) {
    return {
      leftSide: [],
      rightSide: [],
      microPlates: [],
      barWeight,
      total: barWeight
    };
  }
  
  // Try to distribute weight evenly on both sides
  const perSide = remainingWeight / 2;
  
  // Build plate combination for one side
  const sidePlates: number[] = [];
  let remaining = perSide;
  
  // Use largest plates first
  const sortedPlates = [...profile.sides].sort((a, b) => b - a);
  
  for (const plate of sortedPlates) {
    while (remaining >= plate) {
      sidePlates.push(plate);
      remaining -= plate;
    }
  }
  
  // Handle remaining weight with micro plates
  const microPlates: number[] = [];
  const sortedMicro = [...profile.micro].sort((a, b) => b - a);
  
  for (const micro of sortedMicro) {
    while (remaining >= micro) {
      microPlates.push(micro);
      remaining -= micro;
    }
  }
  
  // Calculate actual total
  const actualTotal = barWeight + (sidePlates.reduce((sum, p) => sum + p, 0) * 2) + 
                      microPlates.reduce((sum, p) => sum + p, 0);
  
  return {
    leftSide: sidePlates,
    rightSide: sidePlates, // Same on both sides
    microPlates,
    barWeight,
    total: actualTotal
  };
};

// Generate smart weight suggestions based on last performance
export const suggestNextWeight = (
  lastWeight: number,
  repsCompleted: number,
  targetReps: number,
  loadType: LoadType,
  profile: PlateProfile
): number => {
  const increments = makeIncrementTable(loadType, profile);
  const smallestStep = increments.length > 1 ? increments[1] - increments[0] : (profile.unit === 'kg' ? 2.5 : 5);
  
  let suggested = lastWeight;
  
  if (repsCompleted >= targetReps) {
    // Successful set, increase weight
    suggested = lastWeight + smallestStep;
  } else if (repsCompleted < targetReps * 0.7) {
    // Failed badly, decrease weight
    suggested = lastWeight - smallestStep;
  }
  // Otherwise keep the same weight
  
  return closestLoad(suggested, loadType, profile);
};
