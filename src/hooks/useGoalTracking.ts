import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  type: "1rm" | "volume" | "bodyweight" | "endurance" | "consistency";
  target_value: number;
  current_value: number;
  unit: string;
  target_date: string;
  priority: "low" | "medium" | "high";
  status: "active" | "achieved" | "missed" | "paused";
  exercise_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalInput {
  title: string;
  type: Goal["type"];
  target_value: number;
  unit: string;
  target_date: string;
  priority: Goal["priority"];
  exercise_id?: string;
  notes?: string;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  id: string;
  current_value?: number;
  status?: Goal["status"];
}

export const useGoals = () => {
  return useQuery({
    queryKey: ["user_goals"],
    queryFn: async (): Promise<Goal[]> => {
      const { data, error } = await supabase
        .from('user_goals')
        .select(`
          *,
          exercises(name, slug)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: CreateGoalInput): Promise<Goal> => {
      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          ...input,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          current_value: 0,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_goals"] });
      toast({
        title: "Goal Created",
        description: "Your new goal has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to create goal:", error);
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: UpdateGoalInput): Promise<Goal> => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('user_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user_goals"] });
      
      if (data.status === 'achieved') {
        toast({
          title: "🎉 Goal Achieved!",
          description: `Congratulations on reaching your ${data.title} goal!`,
        });
      } else {
        toast({
          title: "Goal Updated",
          description: "Your goal has been updated successfully.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update goal. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to update goal:", error);
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (goalId: string): Promise<void> => {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_goals"] });
      toast({
        title: "Goal Deleted",
        description: "Goal has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to delete goal:", error);
    },
  });
};

export const useGoalTracking = () => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  
  const goals = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const updateProgress = useCallback(async (goalId: string, newValue: number) => {
    const goal = goals.data?.find(g => g.id === goalId);
    if (!goal) return;

    const wasAchieved = goal.current_value >= goal.target_value;
    const isNowAchieved = newValue >= goal.target_value;
    
    const status = isNowAchieved && !wasAchieved ? 'achieved' : goal.status;

    await updateGoal.mutateAsync({
      id: goalId,
      current_value: newValue,
      status
    });
  }, [goals.data, updateGoal]);

  const checkAndUpdateGoalsFromWorkout = useCallback(async (workoutId: string) => {
    // This would be called after completing a workout to automatically update goal progress
    // Implementation would depend on specific goal types and how they relate to workout data
    
    try {
      const { data: personalRecords } = await supabase
        .from('personal_records')
        .select('exercise_id, kind, value, unit')
        .eq('workout_set_id', workoutId);

      if (!personalRecords || !goals.data) return;

      for (const pr of personalRecords) {
        if (pr.kind === '1RM') {
          // Find goals related to this exercise and 1RM
          const relatedGoals = goals.data.filter(goal => 
            goal.exercise_id === pr.exercise_id && 
            goal.type === '1rm' &&
            goal.status === 'active'
          );

          for (const goal of relatedGoals) {
            if (pr.value > goal.current_value) {
              await updateProgress(goal.id, pr.value);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error updating goals from workout:', error);
    }
  }, [goals.data, updateProgress]);

  const getGoalProgress = useCallback((goal: Goal) => {
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  }, []);

  const getDaysUntilTarget = useCallback((targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  const getGoalsByStatus = useCallback((status: Goal["status"]) => {
    return goals.data?.filter(goal => goal.status === status) || [];
  }, [goals.data]);

  return {
    // Data
    goals: goals.data || [],
    isLoading: goals.isLoading,
    selectedGoal,
    
    // Actions
    createGoal: createGoal.mutateAsync,
    updateGoal: updateGoal.mutateAsync,
    deleteGoal: deleteGoal.mutateAsync,
    updateProgress,
    checkAndUpdateGoalsFromWorkout,
    setSelectedGoal,
    
    // Computed
    getGoalProgress,
    getDaysUntilTarget,
    getGoalsByStatus,
    
    // States
    isCreating: createGoal.isPending,
    isUpdating: updateGoal.isPending,
    isDeleting: deleteGoal.isPending,
  };
};