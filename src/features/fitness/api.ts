import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type UUID = string;

export interface Workout {
  id: UUID;
  user_id: UUID;
  started_at: string;
  ended_at?: string | null;
  title?: string | null;
  notes?: string | null;
  perceived_exertion?: number | null;
}

export interface WorkoutExercise {
  id: UUID;
  workout_id: UUID;
  exercise_id: UUID;
  order_index: number;
  is_superset_group?: string | null;
  notes?: string | null;
}

export interface WorkoutSet {
  id: UUID;
  workout_exercise_id: UUID;
  set_index: number;
  set_kind: string;
  reps?: number | null;
  weight?: number | null;
  weight_unit: string;
  duration_seconds?: number | null;
  distance?: number | null;
  rpe?: number | null;
  completed_at?: string | null;
  is_completed: boolean;
  notes?: string | null;
}

export interface Exercise {
  id: UUID;
  translations: Record<string, { name: string; description?: string }> | null;
  // Additional fields like body_part_id, primary_muscle_id, equipment_id may exist but are not required here
}

export interface Template {
  id: UUID;
  user_id: UUID;
  name?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface TemplateExercise {
  id: UUID;
  template_id: UUID;
  exercise_id: UUID;
  order_index: number;
  default_sets: number;
  target_reps?: number | null;
  target_weight?: number | null;
  weight_unit: string;
  notes?: string | null;
}

export interface PersonalRecord {
  id: UUID;
  user_id: UUID;
  exercise_id: UUID;
  kind: string;
  value: number;
  unit?: string | null;
  achieved_at: string;
  workout_set_id?: UUID | null;
}

export interface UserSettings {
  user_id: UUID;
  timezone: string;
  unit_weight: "kg" | "lb";
}

export const useUserSettings = () => {
  return useQuery({
    queryKey: ["user_settings"],
    queryFn: async (): Promise<UserSettings | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_settings")
        .select("user_id, timezone, unit_weight")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });
};

export const useUpsertUserSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (partial: Partial<UserSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const payload = { user_id: user.id, timezone: "UTC", unit_weight: "kg", ...partial };
      const { error } = await supabase.from("user_settings").upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user_settings"] }),
  });
};

export const useRecentWorkouts = (limit = 5) => {
  return useQuery({
    queryKey: ["workouts", { limit }],
    queryFn: async (): Promise<Workout[]> => {
      const { data, error } = await supabase
        .from("workouts")
        .select("id,user_id,started_at,ended_at,title,notes,perceived_exertion")
        .order("started_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as any;
    },
  });
};

export const useStartWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId?: UUID | null): Promise<UUID> => {
      const { data, error } = await supabase
        .rpc("start_workout", { p_template_id: templateId ?? null });
      if (error) throw error;
      return data as any;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  });
};

export const useEndWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (workoutId: UUID) => {
      const { error } = await supabase.rpc("end_workout", { p_workout_id: workoutId });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  });
};

export const useWorkoutDetail = (workoutId?: UUID) => {
  return useQuery({
    enabled: !!workoutId,
    queryKey: ["workout_detail", workoutId],
    queryFn: async () => {
      if (!workoutId) return null;
      const { data: workout, error: e1 } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", workoutId)
        .maybeSingle();
      if (e1) throw e1;
      const { data: exercises, error: e2 } = await supabase
        .from("workout_exercises")
        .select("*")
        .eq("workout_id", workoutId)
        .order("order_index", { ascending: true });
      if (e2) throw e2;
      const weIds = (exercises ?? []).map((e) => e.id);
      let setsByWe: Record<string, WorkoutSet[]> = {};
      if (weIds.length) {
        const { data: sets, error: e3 } = await supabase
          .from("workout_sets")
          .select("*")
          .in("workout_exercise_id", weIds)
          .order("set_index", { ascending: true });
        if (e3) throw e3;
        for (const s of sets as any[]) {
          const k = s.workout_exercise_id as string;
          (setsByWe[k] ||= []).push(s as any);
        }
      }
      return { workout, exercises: exercises ?? [], setsByWe } as {
        workout: Workout | null;
        exercises: WorkoutExercise[];
        setsByWe: Record<string, WorkoutSet[]>;
      };
    },
  });
};

export const useAddExerciseToWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { workoutId: UUID; exerciseId: UUID }) => {
      const { data: last, error: e1 } = await supabase
        .from("workout_exercises")
        .select("order_index")
        .eq("workout_id", params.workoutId)
        .order("order_index", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (e1 && e1.code !== "PGRST116") throw e1;
      const nextIndex = last?.order_index ? Number(last.order_index) + 1 : 1;
      const { error } = await supabase.from("workout_exercises").insert({
        workout_id: params.workoutId,
        exercise_id: params.exerciseId,
        order_index: nextIndex,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      if (vars?.workoutId) {
        qc.invalidateQueries({ queryKey: ["workout_detail", vars.workoutId] });
      }
    },
  });
};

export const useAddSet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { workoutId: UUID; workoutExerciseId: UUID; payload: any }) => {
      const { error } = await supabase.rpc("add_set", {
        p_workout_exercise_id: params.workoutExerciseId,
        p_payload: params.payload,
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["workout_detail", vars.workoutId] });
      qc.invalidateQueries({ queryKey: ["personal_records"] });
    },
  });
};

export const useSearchExercises = (query: string, _opts?: { primaryMuscle?: string; bodyPart?: string }) => {
  return useQuery({
    queryKey: ["exercises_search", { query }],
    enabled: query.length > 1,
    queryFn: async (): Promise<Exercise[]> => {
      // Search in the translations table directly
      const { data: searchResults, error } = await supabase
        .from("exercises_translations")
        .select("exercise_id, name, description")
        .eq("language_code", "en")
        .ilike("name", `%${query}%`)
        .limit(20);
      
      if (error) throw error;
      
      if (!searchResults || searchResults.length === 0) return [];
      
      // Get exercise details
      const exerciseIds = searchResults.map(r => r.exercise_id);
      const { data: exercises, error: exerciseError } = await supabase
        .from("exercises")
        .select("id,slug,thumbnail_url,image_url,source_url,popularity_rank,is_public")
        .in("id", exerciseIds);
        
      if (exerciseError) throw exerciseError;
      
      // Combine results
      return (exercises || []).map(exercise => {
        const translation = searchResults.find(r => r.exercise_id === exercise.id);
        return {
          ...exercise,
          translations: {
            en: { 
              name: translation?.name || 'Unknown', 
              description: translation?.description 
            }
          }
        };
      }) as Exercise[];
    },
  });
};

export const useTemplates = () => {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async (): Promise<Template[]> => {
      const { data, error } = await supabase
        .from("workout_templates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any;
    },
  });
};

export const useTemplateExercises = (templateId?: UUID) => {
  return useQuery({
    enabled: !!templateId,
    queryKey: ["template_exercises", templateId],
    queryFn: async (): Promise<TemplateExercise[]> => {
      const { data, error } = await supabase
        .from("template_exercises")
        .select("*")
        .eq("template_id", templateId)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as any;
    },
  });
};

export const useCreateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string): Promise<UUID> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data: template, error: templateError } = await supabase
        .from("workout_templates")
        .insert({ user_id: user.id, name })
        .select("id")
        .single();
      if (templateError) throw templateError;
      
      return (template as any).id as UUID;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
};

export const useAddExerciseToTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { templateId: UUID; exerciseId: UUID }) => {
      const { data: last, error: e1 } = await supabase
        .from("template_exercises")
        .select("order_index")
        .eq("template_id", params.templateId)
        .order("order_index", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (e1 && e1.code !== "PGRST116") throw e1;
      const nextIndex = last?.order_index ? Number(last.order_index) + 1 : 1;
      const { error } = await supabase
        .from("template_exercises")
        .insert({
          template_id: params.templateId,
          exercise_id: params.exerciseId,
          order_index: nextIndex,
          default_sets: 3,
          weight_unit: 'kg',
          target_reps: 8,
        });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["template_exercises", vars.templateId] });
    },
  });
};

export const useDeleteTemplateExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: UUID) => {
      const { error } = await supabase.from("template_exercises").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["template_exercises"] }),
  });
};

export const useCloneTemplateToWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: UUID): Promise<UUID> => {
      const { data, error } = await supabase.rpc("clone_template_to_workout", { p_template_id: templateId });
      if (error) throw error;
      return data as any;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  });
};

export const useDeleteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: UUID): Promise<void> => {
      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useCloneTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: UUID): Promise<UUID> => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Get the original template
      const { data: template, error: templateError } = await supabase
        .from('workout_templates')
        .select('name, notes')
        .eq('id', templateId)
        .single();
      if (templateError) throw templateError;

      // Create new template
      const { data: newTemplate, error: createError } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.data.user.id,
          name: `Copy of ${template.name || 'Template'}`,
          notes: template.notes
        })
        .select('id')
        .single();
      if (createError) throw createError;

      // Copy template exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from('template_exercises')
        .select('*')
        .eq('template_id', templateId);
      if (exercisesError) throw exercisesError;

      if (exercises.length > 0) {
        const { error: copyError } = await supabase
          .from('template_exercises')
          .insert(
            exercises.map(ex => ({
              template_id: newTemplate.id,
              exercise_id: ex.exercise_id,
              order_index: ex.order_index,
              default_sets: ex.default_sets,
              target_reps: ex.target_reps,
              target_weight: ex.target_weight,
              weight_unit: ex.weight_unit,
              notes: ex.notes
            }))
          );
        if (copyError) throw copyError;
      }

      return newTemplate.id as UUID;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useUpdateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ templateId, name, notes }: { templateId: UUID; name: string; notes?: string }): Promise<void> => {
      const { error } = await supabase
        .from('workout_templates')
        .update({ name, notes })
        .eq('id', templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

export const useTemplateDetail = (templateId?: UUID) => {
  return useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!templateId,
  });
};

export const useTemplateExercisePreferences = (templateExerciseId?: UUID) => {
  return useQuery({
    queryKey: ['template_exercise_preferences', templateExerciseId],
    queryFn: async () => {
      if (!templateExerciseId) return null;
      const { data, error } = await supabase
        .from('template_exercise_preferences')
        .select('*')
        .eq('template_exercise_id', templateExerciseId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!templateExerciseId,
  });
};

export const useUpsertTemplateExercisePreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      templateExerciseId, 
      preferredGrips, 
      notes 
    }: { 
      templateExerciseId: UUID; 
      preferredGrips: string[]; 
      notes?: string;
    }): Promise<void> => {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('template_exercise_preferences')
        .upsert({
          template_exercise_id: templateExerciseId,
          user_id: user.data.user.id,
          preferred_grips: preferredGrips,
          notes
        });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['template_exercise_preferences', variables.templateExerciseId] });
    },
  });
};

export const usePersonalRecords = () => {
  return useQuery({
    queryKey: ["personal_records"],
    queryFn: async (): Promise<PersonalRecord[]> => {
      const { data, error } = await supabase
        .from("personal_records")
        .select("*")
        .order("achieved_at", { ascending: false });
      if (error) throw error;
      return data as any;
    },
  });
};
