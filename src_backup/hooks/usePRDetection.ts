import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { showPRToast } from '@/components/gamification/PRToast';
import { showXPToast } from '@/components/gamification/XPToast';

interface SetData {
  workout_exercise_id: string;
  weight?: number;
  reps?: number;
  weight_unit?: string;
}

interface ExerciseData {
  id: string;
  name: string;
}

export const usePRDetection = () => {
  const queryClient = useQueryClient();

  const checkForPRs = useCallback(async (setData: SetData, exercise: ExerciseData, workoutId?: string) => {
    if (!setData.weight || !setData.reps) return;

    try {
      // Get user's existing PRs for this exercise
      const { data: existingPRs, error } = await supabase
        .from('personal_records')
        .select('*')
        .eq('exercise_id', exercise.id)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      const newPRs: any[] = [];

      // Check weight PR
      const weightPR = existingPRs?.find(pr => pr.kind === 'heaviest');
      if (!weightPR || setData.weight > weightPR.value) {
        newPRs.push({
          kind: 'heaviest',
          value: setData.weight,
          unit: setData.weight_unit || 'kg'
        });
      }

      // Check reps PR (at same or heavier weight)
      const repsPR = existingPRs?.find(pr => pr.kind === 'reps');
      if (!repsPR || setData.reps > repsPR.value) {
        newPRs.push({
          kind: 'reps',
          value: setData.reps,
          unit: 'reps'
        });
      }

      // Check 1RM PR
      const estimated1RM = setData.weight * (1 + setData.reps / 30);
      const oneRMPR = existingPRs?.find(pr => pr.kind === '1RM');
      if (!oneRMPR || estimated1RM > oneRMPR.value) {
        newPRs.push({
          kind: '1RM',
          value: Math.round(estimated1RM * 100) / 100,
          unit: setData.weight_unit || 'kg'
        });
      }

      // Show PR toasts and award XP
      for (const pr of newPRs) {
        showPRToast({
          personalRecord: {
            id: crypto.randomUUID(),
            exercise_id: exercise.id,
            achieved_at: new Date().toISOString(),
            ...pr
          },
          exerciseName: exercise.name,
          workoutId,
          onShare: workoutId ? () => shareWorkoutWithPR(workoutId, exercise.name, pr) : undefined
        });

        // Award XP for PR
        const xpAmount = pr.kind === '1RM' ? 50 : pr.kind === 'heaviest' ? 30 : 20;
        showXPToast({
          xpGained: xpAmount,
          reason: `${pr.kind === 'heaviest' ? 'Weight' : pr.kind === '1RM' ? '1RM' : 'Rep'} PR on ${exercise.name}!`
        });
      }

      // Invalidate PR queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['personal_records'] });

    } catch (error) {
      console.error('Error checking for PRs:', error);
    }
  }, [queryClient]);

  const shareWorkoutWithPR = useCallback(async (workoutId: string, exerciseName: string, pr: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const prText = pr.kind === 'heaviest' ? `New Weight PR: ${pr.value}${pr.unit}` :
                    pr.kind === '1RM' ? `New 1RM PR: ${pr.value}${pr.unit} (estimated)` :
                    `New Rep PR: ${pr.value} reps`;

      const caption = `🏆 ${prText} on ${exerciseName}! #PersonalRecord #Fitness`;

      const { error } = await supabase
        .from('workout_shares')
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          caption,
          is_public: true
        });

      if (error) throw error;

      // Invalidate social feed to show the new share
      queryClient.invalidateQueries({ queryKey: ['workout_shares'] });

    } catch (error) {
      console.error('Error sharing workout:', error);
    }
  }, [queryClient]);

  return { checkForPRs };
};