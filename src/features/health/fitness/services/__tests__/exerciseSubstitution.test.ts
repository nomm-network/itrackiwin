import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  findAlternatives, 
  saveExercisePreference,
  type ExerciseConstraints 
} from '../exerciseSubstitution.service';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          neq: vi.fn(() => ({
            not: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [] }))
            }))
          }))
        }))
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

describe('Exercise Substitution Service', () => {
  const mockEquipmentCaps = {
    bars: { available: true, weights: [20], defaultWeight: 20 },
    plates: { available: true, weights: [2.5, 5, 10, 20], miniweights: [1.25] },
    dumbbells: { available: true, weights: [5, 10, 15, 20, 25], increment: 2.5 },
    machines: { available: true, stacks: { 'chest-press': { equipmentId: 'cp1', stackWeights: [20, 30, 40], auxWeights: [], increment: 5 } } },
    cables: { available: false, increment: 5 }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAlternatives', () => {
    it('should find alternatives for bench press', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      
      // Mock original exercise (bench press)
      const originalExercise = {
        id: 'bench-press-id',
        name: 'Barbell Bench Press',
        slug: 'barbell-bench-press',
        primary_muscle_id: 'chest',
        secondary_muscle_group_ids: ['shoulders', 'triceps'],
        equipment_id: 'barbell-id',
        equipment: { slug: 'barbell' },
        body_part_id: 'upper-body'
      };

      // Mock alternative exercises
      const alternatives = [
        {
          id: 'db-bench-id',
          name: 'Dumbbell Bench Press',
          slug: 'dumbbell-bench-press',
          primary_muscle_id: 'chest',
          secondary_muscle_group_ids: ['shoulders', 'triceps'],
          equipment_id: 'dumbbell-id',
          equipment: { slug: 'dumbbell' },
          body_part_id: 'upper-body',
          popularity_rank: 2
        },
        {
          id: 'machine-chest-id',
          name: 'Machine Chest Press',
          slug: 'machine-chest-press',
          primary_muscle_id: 'chest',
          secondary_muscle_group_ids: ['shoulders'],
          equipment_id: 'machine-id',
          equipment: { slug: 'machine' },
          body_part_id: 'upper-body',
          popularity_rank: 5
        },
        {
          id: 'smith-bench-id',
          name: 'Smith Machine Bench Press',
          slug: 'smith-machine-bench-press',
          primary_muscle_id: 'chest',
          secondary_muscle_group_ids: ['shoulders', 'triceps'],
          equipment_id: 'smith-id',
          equipment: { slug: 'smith-machine' },
          body_part_id: 'upper-body',
          popularity_rank: 8
        }
      ];

      // Setup mocks
      let callCount = 0;
      supabase.from.mockImplementation((table: string) => {
        if (table === 'exercises') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => {
                if (callCount === 0) {
                  callCount++;
                  return { single: vi.fn(() => Promise.resolve({ data: originalExercise })) };
                } else {
                  return {
                    neq: vi.fn(() => ({
                      not: vi.fn(() => ({
                        limit: vi.fn(() => Promise.resolve({ data: alternatives }))
                      }))
                    }))
                  };
                }
              })
            }))
          };
        }
        return { select: vi.fn(() => ({ eq: vi.fn() })) };
      });

      const result = await findAlternatives(
        'bench-press-id',
        mockEquipmentCaps,
        ['chest']
      );

      expect(result).toHaveLength(3);
      
      // Check dumbbell bench press scores highest (same muscle + movement pattern)
      const dbBench = result.find(alt => alt.slug === 'dumbbell-bench-press');
      expect(dbBench).toBeDefined();
      expect(dbBench!.matchScore).toBeGreaterThan(70);
      expect(dbBench!.matchReasons).toContain('Same primary muscle');
      expect(dbBench!.matchReasons).toContain('Same movement pattern');

      // Check machine chest press has good score
      const machineChest = result.find(alt => alt.slug === 'machine-chest-press');
      expect(machineChest).toBeDefined();
      expect(machineChest!.matchScore).toBeGreaterThan(50);

      // Check Smith machine scores well (same movement + compatible equipment)
      const smithBench = result.find(alt => alt.slug === 'smith-machine-bench-press');
      expect(smithBench).toBeDefined();
      expect(smithBench!.matchScore).toBeGreaterThan(80);
    });

    it('should filter out alternatives for unavailable equipment', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      
      const limitedEquipmentCaps = {
        ...mockEquipmentCaps,
        dumbbells: { available: false, weights: [], increment: 2.5 },
        machines: { available: false, stacks: {} }
      };

      const originalExercise = {
        id: 'bench-press-id',
        name: 'Barbell Bench Press',
        slug: 'barbell-bench-press',
        primary_muscle_id: 'chest',
        equipment: { slug: 'barbell' }
      };

      const alternatives = [
        {
          id: 'db-bench-id',
          name: 'Dumbbell Bench Press',
          slug: 'dumbbell-bench-press',
          primary_muscle_id: 'chest',
          equipment: { slug: 'dumbbell' }
        },
        {
          id: 'pushup-id',
          name: 'Push-up',
          slug: 'push-up',
          primary_muscle_id: 'chest',
          equipment: { slug: 'bodyweight' }
        }
      ];

      let callCount = 0;
      supabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => {
            if (callCount === 0) {
              callCount++;
              return { single: vi.fn(() => Promise.resolve({ data: originalExercise })) };
            } else {
              return {
                neq: vi.fn(() => ({
                  not: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: alternatives }))
                  }))
                }))
              };
            }
          })
        }))
      }));

      const result = await findAlternatives(
        'bench-press-id',
        limitedEquipmentCaps
      );

      // Should only include bodyweight exercises
      expect(result).toHaveLength(1);
      expect(result[0].slug).toBe('push-up');
    });

    it('should apply injury constraints correctly', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      
      const constraints: ExerciseConstraints = {
        avoidInjuries: ['shoulders']
      };

      const originalExercise = {
        id: 'bench-press-id',
        name: 'Barbell Bench Press',
        slug: 'barbell-bench-press',
        primary_muscle_id: 'chest'
      };

      const alternatives = [
        {
          id: 'shoulder-press-id',
          name: 'Shoulder Press',
          slug: 'shoulder-press',
          primary_muscle_id: 'shoulders',
          body_part_id: 'shoulders' // Should be filtered out
        },
        {
          id: 'chest-fly-id',
          name: 'Chest Fly',
          slug: 'chest-fly',
          primary_muscle_id: 'chest',
          body_part_id: 'chest' // Should be included
        }
      ];

      let callCount = 0;
      supabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => {
            if (callCount === 0) {
              callCount++;
              return { single: vi.fn(() => Promise.resolve({ data: originalExercise })) };
            } else {
              return {
                neq: vi.fn(() => ({
                  not: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: alternatives }))
                  }))
                }))
              };
            }
          })
        }))
      }));

      const result = await findAlternatives(
        'bench-press-id',
        mockEquipmentCaps,
        ['chest'],
        constraints
      );

      // Should only include exercises that don't target injured body parts
      expect(result.length).toBe(1);
      expect(result[0].slug).toBe('chest-fly');
    });

    it('should handle preferred equipment constraints', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      
      const constraints: ExerciseConstraints = {
        preferredEquipment: ['dumbbell', 'bodyweight']
      };

      const originalExercise = {
        id: 'bench-press-id',
        name: 'Barbell Bench Press',
        slug: 'barbell-bench-press',
        primary_muscle_id: 'chest'
      };

      const alternatives = [
        {
          id: 'db-bench-id',
          name: 'Dumbbell Bench Press',
          slug: 'dumbbell-bench-press',
          primary_muscle_id: 'chest',
          equipment: { slug: 'dumbbell' } // Should be included
        },
        {
          id: 'machine-press-id',
          name: 'Machine Press',
          slug: 'machine-press',
          primary_muscle_id: 'chest',
          equipment: { slug: 'machine' } // Should be filtered out
        },
        {
          id: 'pushup-id',
          name: 'Push-up',
          slug: 'push-up',
          primary_muscle_id: 'chest',
          equipment: { slug: 'bodyweight' } // Should be included
        }
      ];

      let callCount = 0;
      supabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => {
            if (callCount === 0) {
              callCount++;
              return { single: vi.fn(() => Promise.resolve({ data: originalExercise })) };
            } else {
              return {
                neq: vi.fn(() => ({
                  not: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: alternatives }))
                  }))
                }))
              };
            }
          })
        }))
      }));

      const result = await findAlternatives(
        'bench-press-id',
        mockEquipmentCaps,
        ['chest'],
        constraints
      );

      // Should only include preferred equipment
      expect(result.length).toBe(2);
      expect(result.map(r => r.slug)).toContain('dumbbell-bench-press');
      expect(result.map(r => r.slug)).toContain('push-up');
      expect(result.map(r => r.slug)).not.toContain('machine-press');
    });
  });

  describe('saveExercisePreference', () => {
    it('should save exercise preference successfully', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      
      supabase.from.mockReturnValue({
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      });

      await expect(saveExercisePreference(
        'user-123',
        'template-456',
        'original-exercise-id',
        'preferred-exercise-id'
      )).resolves.not.toThrow();

      expect(supabase.from).toHaveBeenCalledWith('template_exercises');
    });

    it('should handle save errors', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      
      supabase.from.mockReturnValue({
        upsert: vi.fn(() => Promise.resolve({ 
          error: { message: 'Database error' } 
        }))
      });

      await expect(saveExercisePreference(
        'user-123',
        'template-456',
        'original-exercise-id',
        'preferred-exercise-id'
      )).rejects.toThrow('Failed to save exercise preference');
    });
  });

  describe('E2E Test: Bench Press Alternatives', () => {
    it('should provide comprehensive bench press alternatives', async () => {
      const { supabase } = require('@/integrations/supabase/client');
      
      const benchPressExercise = {
        id: 'barbell-bench-press',
        name: 'Barbell Bench Press',
        slug: 'barbell-bench-press',
        primary_muscle_id: 'chest',
        secondary_muscle_group_ids: ['shoulders', 'triceps'],
        equipment: { slug: 'barbell' },
        body_part_id: 'upper-body'
      };

      const expectedAlternatives = [
        {
          id: 'dumbbell-bench-press',
          name: 'Dumbbell Bench Press',
          slug: 'dumbbell-bench-press',
          primary_muscle_id: 'chest',
          secondary_muscle_group_ids: ['shoulders', 'triceps'],
          equipment: { slug: 'dumbbell' },
          body_part_id: 'upper-body',
          popularity_rank: 2
        },
        {
          id: 'smith-machine-bench-press',
          name: 'Smith Machine Bench Press',
          slug: 'smith-machine-bench-press',
          primary_muscle_id: 'chest',
          secondary_muscle_group_ids: ['shoulders', 'triceps'],
          equipment: { slug: 'smith-machine' },
          body_part_id: 'upper-body',
          popularity_rank: 3
        },
        {
          id: 'machine-chest-press',
          name: 'Machine Chest Press',
          slug: 'machine-chest-press',
          primary_muscle_id: 'chest',
          secondary_muscle_group_ids: ['shoulders'],
          equipment: { slug: 'machine' },
          body_part_id: 'upper-body',
          popularity_rank: 4
        }
      ];

      let callCount = 0;
      supabase.from.mockImplementation(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => {
            if (callCount === 0) {
              callCount++;
              return { single: vi.fn(() => Promise.resolve({ data: benchPressExercise })) };
            } else {
              return {
                neq: vi.fn(() => ({
                  not: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({ data: expectedAlternatives }))
                  }))
                }))
              };
            }
          })
        }))
      }));

      const alternatives = await findAlternatives(
        'barbell-bench-press',
        mockEquipmentCaps,
        ['chest']
      );

      // Should find all expected alternatives
      expect(alternatives.length).toBe(3);
      
      // Verify specific alternatives are present
      const alternativeSlugs = alternatives.map(alt => alt.slug);
      expect(alternativeSlugs).toContain('dumbbell-bench-press');
      expect(alternativeSlugs).toContain('smith-machine-bench-press');
      expect(alternativeSlugs).toContain('machine-chest-press');

      // Verify match scores are reasonable
      alternatives.forEach(alt => {
        expect(alt.matchScore).toBeGreaterThan(40);
        expect(alt.matchReasons.length).toBeGreaterThan(0);
      });

      // Dumbbell bench should score highest due to movement pattern match
      const dumbbellBench = alternatives.find(alt => alt.slug === 'dumbbell-bench-press');
      const machineBench = alternatives.find(alt => alt.slug === 'machine-chest-press');
      
      expect(dumbbellBench!.matchScore).toBeGreaterThanOrEqual(machineBench!.matchScore);
    });
  });
});