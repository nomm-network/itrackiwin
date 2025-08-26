import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface CreateWorkoutFromTemplateParams {
  templateId: string;
}

export function useCreateWorkoutFromTemplate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId }: CreateWorkoutFromTemplateParams) => {
      if (!user?.id) throw new Error('User not authenticated');

      console.log('Creating workout from template:', templateId);

      // Create workout
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          title: 'New Workout',
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Get template exercises with grip information
      const { data: templateExercises, error: templateError } = await supabase
        .from('template_exercises')
        .select('*')
        .eq('template_id', templateId)
        .order('order_index');

      if (templateError) throw templateError;

      // Create workout exercises with grip information
      const workoutExercises = templateExercises.map(te => ({
        workout_id: workout.id,
        exercise_id: te.exercise_id,
        order_index: te.order_index,
        grip_ids: te.grip_ids,
        display_name: te.display_name,
        notes: te.notes
      }));

      const { data: createdExercises, error: exerciseError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises)
        .select();

      if (exerciseError) throw exerciseError;

      // Create default sets for each exercise
      const sets = [];
      for (const exercise of createdExercises) {
        const templateExercise = templateExercises.find(te => te.exercise_id === exercise.exercise_id);
        const defaultSets = templateExercise?.default_sets || 3;
        
        for (let i = 1; i <= defaultSets; i++) {
          sets.push({
            workout_exercise_id: exercise.id,
            set_index: i,
            set_kind: 'normal' as const,
            is_completed: false,
            weight_unit: templateExercise?.weight_unit || 'kg'
          });
        }
      }

      if (sets.length > 0) {
        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(sets);

        if (setsError) throw setsError;
      }

      console.log('Workout created successfully:', workout.id);
      return workout;
    },
    onSuccess: (workout) => {
      toast.success('Workout created from template');
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout', workout.id] });
    },
    onError: (error) => {
      console.error('Failed to create workout from template:', error);
      toast.error('Failed to create workout from template');
    }
  });
}