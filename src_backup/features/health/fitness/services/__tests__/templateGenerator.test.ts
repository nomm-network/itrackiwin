import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  generateTemplate, 
  calculateVolumeAllocation, 
  generateSetRepScheme, 
  type TemplateGeneratorInputs 
} from '../templateGenerator.service';

// Mock dependencies
vi.mock('@/integrations/supabase/client');
vi.mock('../equipmentCapabilities.service');
vi.mock('../musclePriorityService');
vi.mock('../../utils/sexBasedTraining');

describe('Workout Template Generator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Golden test personas
  const beginner: TemplateGeneratorInputs = {
    userId: 'beginner-user',
    goal: 'general_fitness',
    experienceLevel: 'beginner',
    daysPerWeek: 3,
    sessionLengthMinutes: 60,
    prioritizedMuscles: [],
    injuries: [],
    equipmentCapabilities: {
      bars: { available: true, weights: [20], defaultWeight: 20 },
      plates: { available: true, weights: [2.5, 5, 10, 20], miniweights: [1.25] },
      dumbbells: { available: true, weights: [5, 10, 15, 20, 25], increment: 2.5 },
      machines: { available: false, stacks: {} },
      cables: { available: false, increment: 5 }
    }
  };

  const intermediate: TemplateGeneratorInputs = {
    userId: 'intermediate-user',
    goal: 'hypertrophy',
    experienceLevel: 'intermediate',
    daysPerWeek: 4,
    sessionLengthMinutes: 75,
    prioritizedMuscles: ['chest', 'shoulders'],
    injuries: ['lower-back'],
    equipmentCapabilities: {
      bars: { available: true, weights: [15, 20], defaultWeight: 20 },
      plates: { available: true, weights: [1.25, 2.5, 5, 10, 15, 20], miniweights: [0.5, 1.25] },
      dumbbells: { available: true, weights: [5, 7.5, 10, 12.5, 15, 17.5, 20, 22.5, 25, 30], increment: 2.5 },
      machines: { available: true, stacks: { 'chest-press': { equipmentId: 'cp1', stackWeights: [20, 30, 40, 50], auxWeights: [], increment: 5 } } },
      cables: { available: true, increment: 2.5 }
    }
  };

  const advanced: TemplateGeneratorInputs = {
    userId: 'advanced-user',
    goal: 'strength',
    experienceLevel: 'advanced',
    daysPerWeek: 5,
    sessionLengthMinutes: 90,
    prioritizedMuscles: ['legs', 'back'],
    injuries: [],
    equipmentCapabilities: {
      bars: { available: true, weights: [15, 20, 25], defaultWeight: 20 },
      plates: { available: true, weights: [0.5, 1.25, 2.5, 5, 10, 15, 20, 25], miniweights: [0.25, 0.5, 1.25] },
      dumbbells: { available: true, weights: Array.from({length: 20}, (_, i) => 5 + i * 2.5), increment: 2.5 },
      machines: { available: true, stacks: { 
        'leg-press': { equipmentId: 'lp1', stackWeights: [50, 75, 100, 125, 150], auxWeights: [5, 10], increment: 5 },
        'lat-pulldown': { equipmentId: 'lpd1', stackWeights: [30, 40, 50, 60, 70], auxWeights: [], increment: 5 }
      }},
      cables: { available: true, increment: 2.5 }
    }
  };

  describe('Volume Allocation', () => {
    it('should calculate correct volume allocation for beginners', () => {
      const mockMuscleGroups = [
        { id: 'chest', slug: 'chest' },
        { id: 'back', slug: 'back' },
        { id: 'legs', slug: 'legs' }
      ];
      const priorityWeights = { chest: 1.0, back: 1.0, legs: 1.0 };

      const allocation = calculateVolumeAllocation(beginner, priorityWeights, mockMuscleGroups);

      expect(allocation).toHaveLength(3);
      allocation.forEach(alloc => {
        expect(alloc.weeklySetTarget).toBeGreaterThan(0);
        expect(alloc.setsPerSession).toBeGreaterThan(0);
        expect(alloc.priorityMultiplier).toBe(1.0);
      });
    });

    it('should apply priority multipliers correctly', () => {
      const mockMuscleGroups = [
        { id: 'chest', slug: 'chest' },
        { id: 'legs', slug: 'legs' }
      ];
      const priorityWeights = { chest: 1.5, legs: 1.0 }; // Chest prioritized

      const allocation = calculateVolumeAllocation(intermediate, priorityWeights, mockMuscleGroups);
      
      const chestAllocation = allocation.find(a => a.muscleGroupId === 'chest');
      const legsAllocation = allocation.find(a => a.muscleGroupId === 'legs');

      expect(chestAllocation?.priorityMultiplier).toBe(1.5);
      expect(legsAllocation?.priorityMultiplier).toBe(1.0);
      expect(chestAllocation?.weeklySetTarget).toBeGreaterThan(legsAllocation?.weeklySetTarget || 0);
    });

    it('should scale volume by experience level', () => {
      const mockMuscleGroups = [{ id: 'chest', slug: 'chest' }];
      const priorityWeights = { chest: 1.0 };

      const beginnerAllocation = calculateVolumeAllocation(beginner, priorityWeights, mockMuscleGroups);
      const advancedAllocation = calculateVolumeAllocation(advanced, priorityWeights, mockMuscleGroups);

      expect(advancedAllocation[0].weeklySetTarget).toBeGreaterThan(beginnerAllocation[0].weeklySetTarget);
    });
  });

  describe('Set/Rep Schemes', () => {
    it('should generate appropriate schemes for strength training', () => {
      const compoundScheme = generateSetRepScheme('strength', 'advanced', 'compound');
      const isolationScheme = generateSetRepScheme('strength', 'advanced', 'isolation');

      expect(compoundScheme.repRangeMin).toBeLessThanOrEqual(5);
      expect(compoundScheme.repRangeMax).toBeLessThanOrEqual(5);
      expect(compoundScheme.restSeconds).toBeGreaterThanOrEqual(180);

      expect(isolationScheme.repRangeMin).toBeGreaterThan(compoundScheme.repRangeMin);
      expect(isolationScheme.restSeconds).toBeLessThan(compoundScheme.restSeconds);
    });

    it('should generate appropriate schemes for hypertrophy training', () => {
      const scheme = generateSetRepScheme('hypertrophy', 'intermediate', 'isolation');

      expect(scheme.repRangeMin).toBeGreaterThanOrEqual(8);
      expect(scheme.repRangeMax).toBeLessThanOrEqual(15);
      expect(scheme.restSeconds).toBeGreaterThanOrEqual(60);
      expect(scheme.restSeconds).toBeLessThanOrEqual(120);
    });

    it('should generate appropriate schemes for endurance training', () => {
      const scheme = generateSetRepScheme('endurance', 'beginner', 'compound');

      expect(scheme.repRangeMin).toBeGreaterThanOrEqual(12);
      expect(scheme.repRangeMax).toBeGreaterThanOrEqual(15);
      expect(scheme.restSeconds).toBeLessThanOrEqual(90);
    });
  });

  describe('Golden Test Snapshots', () => {
    beforeEach(() => {
      // Mock all external dependencies for deterministic results
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: { sex: 'male' } })),
              limit: vi.fn(() => Promise.resolve({ 
                data: [
                  { id: 'chest', slug: 'chest' },
                  { id: 'back', slug: 'back' },
                  { id: 'legs', slug: 'legs' },
                  { id: 'shoulders', slug: 'shoulders' },
                  { id: 'arms', slug: 'arms' }
                ] 
              }))
            })),
            or: vi.fn(() => ({
              eq: vi.fn(() => ({
                not: vi.fn(() => ({
                  order: vi.fn(() => ({
                    limit: vi.fn(() => Promise.resolve({
                      data: [
                        { 
                          id: 'bench-press', 
                          name: 'Bench Press', 
                          slug: 'bench-press',
                          equipment: { slug: 'barbell' },
                          primary_muscle_id: 'chest',
                          secondary_muscle_group_ids: ['shoulders']
                        },
                        { 
                          id: 'squat', 
                          name: 'Squat', 
                          slug: 'squat',
                          equipment: { slug: 'barbell' },
                          primary_muscle_id: 'legs',
                          secondary_muscle_group_ids: ['back']
                        }
                      ]
                    }))
                  }))
                }))
              }))
            }))
          }))
        }))
      };

      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: mockSupabase
      }));

      vi.doMock('../equipmentCapabilities.service', () => ({
        getEquipmentCapabilities: vi.fn(() => Promise.resolve(beginner.equipmentCapabilities))
      }));

      vi.doMock('../musclePriorityService', () => ({
        getMusclePriorityWeights: vi.fn(() => Promise.resolve({ chest: 1.0, back: 1.0, legs: 1.0 }))
      }));

      vi.doMock('../../utils/sexBasedTraining', () => ({
        getSexBasedTrainingConfig: vi.fn(() => ({
          volumeMultiplier: 1.0,
          repRangeMultiplier: 1.0,
          restTimeMultiplier: 1.0,
          biasNotes: []
        }))
      }));
    });

    it('should generate consistent template for beginner persona', async () => {
      const template = await generateTemplate(beginner);

      // Golden snapshot assertions
      expect(template.template.name).toBe('3-Day General Fitness Split');
      expect(template.template.difficulty_level).toBe('beginner');
      expect(template.template.estimated_duration_minutes).toBeLessThanOrEqual(60);
      expect(template.exercises.length).toBeGreaterThan(0);
      expect(template.exercises.length).toBeLessThanOrEqual(8);

      // Verify rep ranges appropriate for general fitness
      template.exercises.forEach(ex => {
        expect(ex.repRangeMin).toBeGreaterThanOrEqual(8);
        expect(ex.repRangeMax).toBeLessThanOrEqual(15);
        expect(ex.defaultSets).toBeGreaterThanOrEqual(2);
        expect(ex.defaultSets).toBeLessThanOrEqual(4);
      });
    });

    it('should generate consistent template for intermediate persona', async () => {
      const template = await generateTemplate(intermediate);

      expect(template.template.name).toBe('4-Day Hypertrophy Split');
      expect(template.template.difficulty_level).toBe('intermediate');
      expect(template.template.estimated_duration_minutes).toBeLessThanOrEqual(75);

      // Verify hypertrophy-focused rep ranges
      template.exercises.forEach(ex => {
        expect(ex.repRangeMin).toBeGreaterThanOrEqual(6);
        expect(ex.repRangeMax).toBeLessThanOrEqual(15);
        expect(ex.restSeconds).toBeGreaterThanOrEqual(60);
        expect(ex.restSeconds).toBeLessThanOrEqual(180);
      });
    });

    it('should generate consistent template for advanced persona', async () => {
      const template = await generateTemplate(advanced);

      expect(template.template.name).toBe('5-Day Strength Split');
      expect(template.template.difficulty_level).toBe('advanced');
      expect(template.template.estimated_duration_minutes).toBeLessThanOrEqual(90);

      // Verify strength-focused rep ranges
      const hasLowRepExercises = template.exercises.some(ex => ex.repRangeMin <= 5);
      expect(hasLowRepExercises).toBe(true);

      // Verify longer rest periods for strength training
      const hasLongRest = template.exercises.some(ex => ex.restSeconds >= 180);
      expect(hasLongRest).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing muscle groups gracefully', async () => {
      vi.doMock('@/integrations/supabase/client', () => ({
        supabase: {
          from: vi.fn(() => ({
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn(() => Promise.resolve({ data: { sex: 'male' } })),
                limit: vi.fn(() => Promise.resolve({ data: [] }))
              }))
            }))
          }))
        }
      }));

      await expect(generateTemplate(beginner)).rejects.toThrow('No muscle groups found');
    });

    it('should handle invalid inputs gracefully', async () => {
      const invalidInputs = {
        ...beginner,
        daysPerWeek: 0,
        sessionLengthMinutes: -10
      };

      // Should not crash, but may produce suboptimal results
      const template = await generateTemplate(invalidInputs);
      expect(template).toBeDefined();
    });
  });
});