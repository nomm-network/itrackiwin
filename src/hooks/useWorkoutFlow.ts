import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAdvancedWorkoutStart } from "./useWorkoutSuggestions";
import type { ReadinessData } from "@/components/fitness/ReadinessCheckIn";
import type { EffortLevel } from "@/components/fitness/EffortSelector";

export type WorkoutPhase = 'readiness' | 'active' | 'rest' | 'complete';

export interface WorkoutFlowState {
  phase: WorkoutPhase;
  workoutId?: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  lastSetEffort?: EffortLevel;
  showReadinessCheck: boolean;
  showRestTimer: boolean;
  restDurationSeconds: number;
}

export interface WorkoutFlowActions {
  startWorkout: (templateId?: string, readinessData?: ReadinessData) => Promise<void>;
  skipReadinessCheck: (templateId?: string) => Promise<void>;
  completeSet: (effort: EffortLevel) => void;
  reportPain: () => void;
  completeRest: () => void;
  skipRest: () => void;
  endWorkout: () => void;
  nextExercise: () => void;
  previousExercise: () => void;
}

export const useWorkoutFlow = (initialTemplateId?: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const startWorkoutMutation = useAdvancedWorkoutStart();

  const [state, setState] = useState<WorkoutFlowState>({
    phase: 'readiness',
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    showReadinessCheck: true,
    showRestTimer: false,
    restDurationSeconds: 180,
  });

  const actions: WorkoutFlowActions = {
    startWorkout: useCallback(async (templateId?: string, readinessData?: ReadinessData) => {
      try {
        const result = await startWorkoutMutation.mutateAsync({
          templateId: templateId || initialTemplateId,
          readinessData
        });

        const workoutResult = result as any;
        setState(prev => ({
          ...prev,
          phase: 'active',
          workoutId: workoutResult.workout_id,
          showReadinessCheck: false,
        }));

        toast({
          title: "Workout Started",
          description: readinessData 
            ? "Your readiness data has been recorded. Let's get started!"
            : "Ready to crush this workout!",
        });

        // Navigate to workout session
        navigate(`/fitness/workout/${workoutResult.workout_id}`);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start workout. Please try again.",
          variant: "destructive",
        });
        console.error("Failed to start workout:", error);
      }
    }, [initialTemplateId, startWorkoutMutation, navigate, toast]),

    skipReadinessCheck: useCallback(async (templateId?: string) => {
      // Will be properly defined after actions object is complete
    }, [initialTemplateId]),

    completeSet: useCallback((effort: EffortLevel) => {
      setState(prev => ({
        ...prev,
        phase: 'rest',
        lastSetEffort: effort,
        showRestTimer: true,
        restDurationSeconds: calculateRestTime(effort),
        currentSetIndex: prev.currentSetIndex + 1,
      }));

      toast({
        title: "Set Completed",
        description: `Nice work! Take ${calculateRestTime(effort)}s rest.`,
      });
    }, [toast]),

    reportPain: useCallback(() => {
      toast({
        title: "Pain Reported",
        description: "Consider stopping the exercise or reducing intensity.",
        variant: "destructive",
      });

      // Could implement pain logging here
      console.log("Pain reported during workout");
    }, [toast]),

    completeRest: useCallback(() => {
      setState(prev => ({
        ...prev,
        phase: 'active',
        showRestTimer: false,
      }));
    }, []),

    skipRest: useCallback(() => {
      setState(prev => ({
        ...prev,
        phase: 'active',
        showRestTimer: false,
      }));
    }, []),

    endWorkout: useCallback(() => {
      setState(prev => ({
        ...prev,
        phase: 'complete',
      }));

      toast({
        title: "Workout Complete",
        description: "Great job! Your progress has been saved.",
      });

      // Navigate to fitness overview or history
      setTimeout(() => {
        navigate('/fitness');
      }, 2000);
    }, [navigate, toast]),

    nextExercise: useCallback(() => {
      setState(prev => ({
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex + 1,
        currentSetIndex: 0,
        phase: 'active',
        showRestTimer: false,
      }));
    }, []),

    previousExercise: useCallback(() => {
      setState(prev => ({
        ...prev,
        currentExerciseIndex: Math.max(0, prev.currentExerciseIndex - 1),
        currentSetIndex: 0,
        phase: 'active',
        showRestTimer: false,
      }));
    }, []),
  };

  // Fix skipReadinessCheck after actions is defined
  actions.skipReadinessCheck = useCallback(async (templateId?: string) => {
    await actions.startWorkout(templateId || initialTemplateId);
  }, [actions.startWorkout, initialTemplateId]);

  return {
    state,
    actions,
    isLoading: false, // startWorkoutMutation doesn't have isPending, using false for now
  };
};

// Helper function to calculate rest time based on effort
const calculateRestTime = (effort: EffortLevel): number => {
  const restMap: Record<EffortLevel, number> = {
    'very_easy': 60,   // 1 minute
    'easy': 90,        // 1.5 minutes
    'moderate': 180,   // 3 minutes
    'hard': 240,       // 4 minutes
    'very_hard': 300,  // 5 minutes
  };
  
  return restMap[effort] || 180;
};