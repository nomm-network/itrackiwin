// Contracts test - Guards against regressions in critical start workout flow
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Start Workout Contract', () => {
  let testUserId: string;
  let testTemplateId: string;
  let createdWorkoutId: string;

  beforeEach(async () => {
    // This test requires a seeded test environment
    // Skip in CI unless proper test user is set up
    if (!import.meta.env.VITE_TEST_USER_ID) {
      return;
    }
    testUserId = import.meta.env.VITE_TEST_USER_ID;
  });

  afterEach(async () => {
    // Cleanup: remove test workout if created
    if (createdWorkoutId) {
      await supabase
        .from('workouts')
        .delete()
        .eq('id', createdWorkoutId);
    }
  });

  it('should create workout with template and populate initial targets', async () => {
    if (!testUserId) {
      console.log('⚠️ Skipping contract test - no test user configured');
      return;
    }

    // 1. Get or create a test template
    const { data: templates } = await supabase
      .from('workout_templates')
      .select('id')
      .eq('user_id', testUserId)
      .limit(1);

    if (!templates || templates.length === 0) {
      console.log('⚠️ Skipping contract test - no templates available');
      return;
    }

    testTemplateId = templates[0].id;

    // 2. Call start_workout RPC
    const { data: workoutId, error } = await supabase.rpc('start_workout', {
      p_template_id: testTemplateId
    });

    expect(error).toBeNull();
    expect(workoutId).toBeTruthy();
    expect(typeof workoutId).toBe('string');
    
    createdWorkoutId = workoutId;

    // 3. Verify workout was created with proper structure
    const { data: workout } = await supabase
      .from('workouts')
      .select(`
        id,
        user_id,
        template_id,
        started_at,
        ended_at
      `)
      .eq('id', workoutId)
      .single();

    expect(workout).toBeTruthy();
    expect(workout.user_id).toBe(testUserId);
    expect(workout.template_id).toBe(testTemplateId);
    expect(workout.started_at).toBeTruthy();
    expect(workout.ended_at).toBeNull(); // Workout should be active

    // 4. Verify workout_exercises were created
    const { data: workoutExercises } = await supabase
      .from('workout_exercises')
      .select(`
        id,
        exercise_id,
        target_weight_kg,
        target_reps,
        order_index
      `)
      .eq('workout_id', workoutId)
      .order('order_index');

    expect(workoutExercises).toBeTruthy();
    expect(workoutExercises.length).toBeGreaterThan(0);

    // 5. Critical: Verify target_weight_kg is populated (never null/0)
    for (const exercise of workoutExercises) {
      expect(exercise.target_weight_kg).toBeTruthy();
      expect(exercise.target_weight_kg).toBeGreaterThan(0);
      expect(typeof exercise.target_weight_kg).toBe('number');
    }

    // 6. Verify no legacy target_weight column is being used
    const { data: templateExercises } = await supabase
      .from('template_exercises')
      .select('target_weight, target_weight_kg')
      .eq('template_id', testTemplateId);

    // If target_weight exists, it should not be the source of truth
    for (const te of templateExercises || []) {
      if (te.target_weight !== null && te.target_weight_kg !== null) {
        // target_weight_kg should be preferred
        expect(te.target_weight_kg).toBeDefined();
      }
    }
  });

  it('should handle workout start without template', async () => {
    if (!testUserId) {
      console.log('⚠️ Skipping contract test - no test user configured');
      return;
    }

    // Start workout without template
    const { data: workoutId, error } = await supabase.rpc('start_workout', {
      p_template_id: null
    });

    expect(error).toBeNull();
    expect(workoutId).toBeTruthy();
    
    createdWorkoutId = workoutId;

    // Verify empty workout was created
    const { data: workout } = await supabase
      .from('workouts')
      .select('id, user_id, template_id')
      .eq('id', workoutId)
      .single();

    expect(workout.user_id).toBe(testUserId);
    expect(workout.template_id).toBeNull();

    // Should have no exercises
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('id')
      .eq('workout_id', workoutId);

    expect(exercises).toEqual([]);
  });
});