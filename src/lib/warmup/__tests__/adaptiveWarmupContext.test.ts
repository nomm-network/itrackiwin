import { describe, it, expect } from 'vitest';
import { 
  createWarmupContext, 
  nextWarmupCountFor, 
  commitExercise,
  nextWarmupCountForSuperset,
  getWarmupPercentages
} from '../adaptiveWarmupContext';

describe('adaptiveWarmupContext', () => {
  it('should recommend 3 sets for cold muscle groups', () => {
    const ctx = createWarmupContext();
    const exercise = { primaryMuscleGroupId: 'chest' };
    
    expect(nextWarmupCountFor(exercise, ctx)).toBe(3);
  });

  it('should recommend 2 sets for muscles touched as secondary', () => {
    const ctx = createWarmupContext();
    
    // First exercise uses chest as secondary
    commitExercise({
      primaryMuscleGroupId: 'shoulders',
      secondaryMuscleGroupIds: ['chest']
    }, ctx);
    
    // Second exercise uses chest as primary
    const chestExercise = { primaryMuscleGroupId: 'chest' };
    expect(nextWarmupCountFor(chestExercise, ctx)).toBe(2);
  });

  it('should recommend 1 set for muscles already worked as primary', () => {
    const ctx = createWarmupContext();
    
    // First chest exercise
    commitExercise({ primaryMuscleGroupId: 'chest' }, ctx);
    
    // Second chest exercise
    const exercise = { primaryMuscleGroupId: 'chest' };
    expect(nextWarmupCountFor(exercise, ctx)).toBe(1);
  });

  it('should handle supersets correctly', () => {
    const ctx = createWarmupContext();
    
    // Previous exercise used shoulders
    commitExercise({ primaryMuscleGroupId: 'shoulders' }, ctx);
    
    // Superset: chest (cold) + triceps (cold)
    const exercises = [
      { primaryMuscleGroupId: 'chest' },
      { primaryMuscleGroupId: 'triceps' }
    ];
    
    expect(nextWarmupCountForSuperset(exercises, ctx)).toBe(3); // Max of [3, 3]
  });

  it('should return correct percentages for each set count', () => {
    expect(getWarmupPercentages(1)).toEqual([70]);
    expect(getWarmupPercentages(2)).toEqual([55, 75]);
    expect(getWarmupPercentages(3)).toEqual([40, 60, 80]);
  });

  it('should not downgrade primary to secondary', () => {
    const ctx = createWarmupContext();
    
    // Exercise uses chest as primary
    commitExercise({ primaryMuscleGroupId: 'chest' }, ctx);
    
    // Later exercise uses chest as secondary - should not affect primary status
    commitExercise({
      primaryMuscleGroupId: 'shoulders',
      secondaryMuscleGroupIds: ['chest']
    }, ctx);
    
    expect(ctx.primary.has('chest')).toBe(true);
    expect(ctx.secondary.has('chest')).toBe(false);
  });
});