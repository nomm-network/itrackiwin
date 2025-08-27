import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getExerciseNameFromTranslations } from "@/utils/exerciseTranslations";

export type UUID = string;

export interface MetricDef {
  id: UUID;
  key: string;
  label: string;
  value_type: 'numeric' | 'integer' | 'text' | 'boolean' | 'enum';
  unit?: string | null;
  enum_options?: string[] | null;
}

export interface ExerciseMetricDef {
  id: UUID;
  exercise_id?: UUID | null;
  equipment_id?: UUID | null;
  metric_id: UUID;
  is_required: boolean;
  order_index: number;
  default_value?: any;
  metric_def?: MetricDef;
}

export interface WorkoutSetMetricValue {
  id: UUID;
  workout_set_id: UUID;
  metric_def_id: UUID;
  numeric_value?: number | null;
  int_value?: number | null;
  text_value?: string | null;
  bool_value?: boolean | null;
}

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
  grip_ids?: string[] | null;
  display_name?: string | null;
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

// Metrics hooks
export const useExerciseMetrics = (exerciseId?: UUID) => {
  return useQuery({
    queryKey: ["exercise_metrics", exerciseId],
    enabled: !!exerciseId,
    queryFn: async (): Promise<ExerciseMetricDef[]> => {
      const { data, error } = await supabase
        .from("exercise_metric_defs")
        .select(`
          id,
          exercise_id,
          equipment_id,
          metric_id,
          is_required,
          order_index,
          default_value,
          metric_defs!inner(
            id,
            key,
            label,
            value_type,
            unit,
            enum_options
          )
        `)
        .eq("exercise_id", exerciseId)
        .order("order_index");
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        metric_def: item.metric_defs as MetricDef
      })) as ExerciseMetricDef[];
    },
  });
};

export const useEquipmentMetrics = (equipmentId?: UUID) => {
  return useQuery({
    queryKey: ["equipment_metrics", equipmentId],
    enabled: !!equipmentId,
    queryFn: async (): Promise<ExerciseMetricDef[]> => {
      const { data, error } = await supabase
        .from("exercise_metric_defs")
        .select(`
          id,
          exercise_id,
          equipment_id,
          metric_id,
          is_required,
          order_index,
          default_value,
          metric_defs!inner(
            id,
            key,
            label,
            value_type,
            unit,
            enum_options
          )
        `)
        .eq("equipment_id", equipmentId)
        .order("order_index");
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        metric_def: item.metric_defs as MetricDef
      })) as ExerciseMetricDef[];
    },
  });
};

export const useCombinedMetrics = (exerciseId?: UUID, equipmentId?: UUID) => {
  return useQuery({
    queryKey: ["combined_metrics", exerciseId, equipmentId],
    enabled: !!exerciseId || !!equipmentId,
    queryFn: async (): Promise<ExerciseMetricDef[]> => {
      let query = supabase
        .from("exercise_metric_defs")
        .select(`
          id,
          exercise_id,
          equipment_id,
          metric_id,
          is_required,
          order_index,
          default_value,
          metric_defs!inner(
            id,
            key,
            label,
            value_type,
            unit,
            enum_options
          )
        `);

      const conditions = [];
      if (exerciseId) conditions.push(`exercise_id.eq.${exerciseId}`);
      if (equipmentId) conditions.push(`equipment_id.eq.${equipmentId}`);
      
      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      }
      
      const { data, error } = await query.order("order_index");
      
      if (error) throw error;
      
      return (data || []).map(item => ({
        ...item,
        metric_def: item.metric_defs as MetricDef
      })) as ExerciseMetricDef[];
    },
  });
};

export const useWorkoutSetMetrics = (workoutSetId?: UUID) => {
  return useQuery({
    queryKey: ["workout_set_metrics", workoutSetId],
    enabled: !!workoutSetId,
    queryFn: async (): Promise<WorkoutSetMetricValue[]> => {
      const { data, error } = await supabase
        .from("workout_set_metric_values")
        .select("*")
        .eq("workout_set_id", workoutSetId);
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useUpsertWorkoutSetMetrics = () => {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      workoutSetId: UUID;
      metrics: Array<{
        metric_def_id: UUID;
        value: any;
        value_type: 'numeric' | 'integer' | 'text' | 'boolean';
      }>;
    }) => {
      const { workoutSetId, metrics } = params;
      
      await supabase
        .from("workout_set_metric_values")
        .delete()
        .eq("workout_set_id", workoutSetId);
      
      const insertData = metrics.map(metric => {
        const baseData = {
          workout_set_id: workoutSetId,
          metric_def_id: metric.metric_def_id,
        };
        
        switch (metric.value_type) {
          case 'numeric':
            return { ...baseData, numeric_value: Number(metric.value) };
          case 'integer':
            return { ...baseData, int_value: parseInt(metric.value) };
          case 'text':
            return { ...baseData, text_value: String(metric.value) };
          case 'boolean':
            return { ...baseData, bool_value: Boolean(metric.value) };
          default:
            return { ...baseData, text_value: String(metric.value) };
        }
      });
      
      if (insertData.length > 0) {
        const { error } = await supabase
          .from("workout_set_metric_values")
          .insert(insertData);
        
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["workout_set_metrics", vars.workoutSetId] });
    },
  });
};

// User settings
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

// Workout hooks
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

export const useUpdateWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { workoutId: string; title?: string; notes?: string }) => {
      const updates: any = {};
      if (params.title !== undefined) updates.title = params.title;
      if (params.notes !== undefined) updates.notes = params.notes;
      
      const { error } = await supabase
        .from("workouts")
        .update(updates)
        .eq("id", params.workoutId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["workout_detail_v5", vars.workoutId] });
    },
  });
};

export const useDeleteWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (workoutId: UUID) => {
      const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workouts"] });
      qc.invalidateQueries({ queryKey: ["workout_detail_v5"] });
    },
  });
};

// Generate workout suggestions based on muscle groups and readiness
const generateWorkoutSuggestions = async (exercises: any[], workout: any) => {
  if (!exercises.length) return { warmupSets: [], targetSets: [] };

  // Get readiness data
  const readinessData = workout.readiness_checkins?.[0];
  
  // Analyze muscle groups involved
  const muscleGroups = new Set();
  const bodyParts = new Set();
  
          exercises.forEach(ex => {
            if (ex.exercises?.muscles?.muscle_groups) {
              muscleGroups.add(ex.exercises.muscles.muscle_groups.slug);
              bodyParts.add(ex.exercises.muscles.muscle_groups.body_parts?.slug);
            }
            // Add secondary muscle groups
            if (ex.exercises?.secondary_muscle_group_ids) {
              ex.exercises.secondary_muscle_group_ids.forEach((id: string) => {
                muscleGroups.add(id);
              });
            }
          });

  // Calculate warmup needs based on muscle activation
  const warmupSets = [];
  const targetSets = [];
  
  // Base warmup on readiness and muscle groups
  const energyLevel = readinessData?.energy || 3;
  const soreness = readinessData?.soreness || 2;
  
  // Generate warmup recommendations
  const warmupIntensity = energyLevel >= 4 && soreness <= 2 ? 'moderate' : 'extended';
  
  exercises.forEach((ex, index) => {
    const exerciseName = ex.exercises?.translations?.en?.name || ex.exercises?.translations?.ro?.name || 'Unknown Exercise';
    
    if (warmupIntensity === 'extended') {
      // More warmup sets for lower energy/higher soreness
      warmupSets.push({
        exercise: exerciseName,
        sets: [
          { weight: '40%', reps: 12, type: 'warmup' },
          { weight: '60%', reps: 8, type: 'warmup' },
          { weight: '75%', reps: 5, type: 'warmup' }
        ]
      });
    } else {
      // Standard warmup
      warmupSets.push({
        exercise: exerciseName,
        sets: [
          { weight: '50%', reps: 10, type: 'warmup' },
          { weight: '70%', reps: 6, type: 'warmup' }
        ]
      });
    }
    
    // Target working sets based on exercise position and readiness
    const isMainLift = index < 2; // First 2 exercises are main lifts
    const targetReps = isMainLift ? (energyLevel >= 4 ? '5-6' : '6-8') : '8-12';
    const workingSets = isMainLift ? 3 : 3;
    
    targetSets.push({
      exercise: exerciseName,
      workingSets,
      targetReps,
      intensity: energyLevel >= 4 ? '85-90%' : '80-85%'
    });
  });

  return { warmupSets, targetSets };
};

export const useWorkoutDetail = (workoutId?: UUID) => {
  return useQuery({
    queryKey: ["workout_detail_v5", workoutId], // Force refresh with new version
    enabled: !!workoutId,
    queryFn: async () => {
      console.log("🔍 [WorkoutDetail] Fetching workout detail for ID:", workoutId);
      
      // Fetch workout data
      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .select("*")
        .eq("id", workoutId)
        .maybeSingle();
      
      if (workoutError) {
        console.error("Workout fetch error:", workoutError);
        throw workoutError;
      }
      
      console.log("Workout fetched:", workout);

      // Fetch workout exercises - Use translation view
      const { data: exercises, error: exercisesError } = await supabase
        .from("workout_exercises")
        .select(`
          *,
          exercises:v_exercises_with_translations (
            id,
            slug,
            translations
          )
        `)
        .eq("workout_id", workoutId)
        .order("order_index");
      
      if (exercisesError) {
        console.error("Exercises fetch error:", exercisesError);
        throw exercisesError;
      }
      
      console.log("Exercises fetched:", exercises);

      // Fetch workout sets 
      const setsByWe: Record<string, any[]> = {};
      if (exercises?.length) {
        const { data: sets, error: setsError } = await supabase
          .from("workout_sets")
          .select("*")
          .in("workout_exercise_id", exercises.map(ex => ex.id))
          .order("set_index");
        
        if (setsError) {
          console.error("Sets fetch error:", setsError);
        } else {
          sets?.forEach(set => {
            if (!setsByWe[set.workout_exercise_id]) {
              setsByWe[set.workout_exercise_id] = [];
            }
            setsByWe[set.workout_exercise_id].push(set);
          });
        }
      }

      // Add warmup suggestions for each exercise
      if (exercises?.length) {
        for (const workoutExercise of exercises) {
          try {
            // Get the working weight from recent sets or exercise defaults
            const exerciseSets = setsByWe[workoutExercise.id] || [];
            const workingSets = exerciseSets.filter(set => set.set_kind !== 'warmup' && set.weight);
            let workingWeight = workingSets.length > 0 ? workingSets[workingSets.length - 1].weight : undefined;
            
            // For new exercises without weight history, use a default based on exercise type
            if (!workingWeight) {
              workingWeight = 60; // Default weight for warmup calculation
            }
            
            try {
              const { data: warmupData, error: warmupError } = await supabase.rpc('fn_suggest_warmup', {
                p_exercise_id: workoutExercise.exercise_id,
                p_working_weight: workingWeight,
                p_working_reps: 8
              });
              
              console.log(`🔥 Warmup RPC call for ${getExerciseNameFromTranslations(workoutExercise.exercises?.translations)}:`, {
                exercise_id: workoutExercise.exercise_id,
                working_weight: workingWeight,
                result: warmupData,
                error: warmupError
              });
              
              if (!warmupError && warmupData) {
                (workoutExercise as any).warmup_suggestion = warmupData;
              } else if (warmupError) {
                console.error('Warmup suggestion error:', warmupError);
                // For testing, add a mock warmup suggestion
                (workoutExercise as any).warmup_suggestion = {
                  warmup_sets: [
                    { set_index: 1, weight: Math.round(workingWeight * 0.4), reps: 10, rest_seconds: 60 },
                    { set_index: 2, weight: Math.round(workingWeight * 0.6), reps: 8, rest_seconds: 90 },
                    { set_index: 3, weight: Math.round(workingWeight * 0.8), reps: 5, rest_seconds: 120 }
                  ]
                };
              }
            } catch (rpcError) {
              console.error('RPC function call failed:', rpcError);
              // Fallback to mock warmup
              (workoutExercise as any).warmup_suggestion = {
                warmup_sets: [
                  { set_index: 1, weight: Math.round(workingWeight * 0.4), reps: 10, rest_seconds: 60 },
                  { set_index: 2, weight: Math.round(workingWeight * 0.6), reps: 8, rest_seconds: 90 },
                  { set_index: 3, weight: Math.round(workingWeight * 0.8), reps: 5, rest_seconds: 120 }
                ]
              };
            }
          } catch (error) {
            console.warn(`⚠️ Failed to get warmup suggestion for exercise ${workoutExercise.exercise_id}:`, error);
          }
        }
      }

      console.log("Final data:", { 
        workoutTitle: workout?.title, 
        exerciseCount: exercises?.length, 
        setsCount: Object.keys(setsByWe).length 
      });

      return {
        workout,
        exercises: exercises || [],
        setsByWe
      };
    },
  });
};

// Template hooks
export const useTemplates = () => {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async (): Promise<Template[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("workout_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("workout_templates")
        .insert({
          name,
          user_id: user.id
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
};

export const useDeleteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: UUID) => {
      const { error } = await supabase
        .from("workout_templates")
        .delete()
        .eq("id", templateId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
};

export const useCloneTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: UUID) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get the original template
      const { data: template, error: fetchError } = await supabase
        .from("workout_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      if (fetchError) throw fetchError;

      // Create the cloned template
      const { data: newTemplate, error: insertError } = await supabase
        .from("workout_templates")
        .insert({
          name: `${template.name} (Copy)`,
          notes: template.notes,
          user_id: user.id
        })
        .select()
        .single();
      if (insertError) throw insertError;

      // Get template exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from("template_exercises")
        .select("*")
        .eq("template_id", templateId);
      if (exercisesError) throw exercisesError;

      // Clone exercises
      if (exercises && exercises.length > 0) {
        const clonedExercises = exercises.map(exercise => ({
          template_id: newTemplate.id,
          exercise_id: exercise.exercise_id,
          order_index: exercise.order_index,
          default_sets: exercise.default_sets,
          target_reps: exercise.target_reps,
          target_weight: exercise.target_weight,
          weight_unit: exercise.weight_unit,
          notes: exercise.notes
        }));

        const { error: cloneError } = await supabase
          .from("template_exercises")
          .insert(clonedExercises);
        if (cloneError) throw cloneError;
      }

      return newTemplate.id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
};

export const useCloneTemplateToWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (templateId: UUID) => {
      const { data, error } = await supabase.rpc("clone_template_to_workout", { p_template_id: templateId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workouts"] }),
  });
};

export const useTemplateDetail = (templateId?: UUID) => {
  return useQuery({
    queryKey: ["template_detail", templateId],
    enabled: !!templateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workout_templates")
        .select("*")
        .eq("id", templateId)
        .single();
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: any) => {
      const { error } = await supabase
        .from("workout_templates")
        .update(params.updates)
        .eq("id", params.templateId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
};

// Template exercise hooks
export const useTemplateExercises = (templateId?: UUID) => {
  return useQuery({
    queryKey: ["template_exercises", templateId],
    enabled: !!templateId,
    queryFn: async (): Promise<TemplateExercise[]> => {
      const { data, error } = await supabase
        .from("template_exercises")
        .select("*")
        .eq("template_id", templateId)
        .order("order_index");
      if (error) throw error;
      return data || [];
    },
  });
};

export const useAddExerciseToTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (exercise: any) => {
      const { data, error } = await supabase
        .from("template_exercises")
        .insert(exercise)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["template_exercises"] }),
  });
};

export const useDeleteTemplateExercise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (exerciseId: UUID) => {
      const { error } = await supabase
        .from("template_exercises")
        .delete()
        .eq("id", exerciseId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["template_exercises"] }),
  });
};

// Exercise search and related
export const useSearchExercises = (query?: string) => {
  return useQuery({
    queryKey: ["search_exercises", query],
    enabled: !!query && query.length > 2,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_exercises_with_translations")
        .select("*")
        .or(`translations->>en->>name.ilike.%${query}%,translations->>ro->>name.ilike.%${query}%`)
        .limit(20);
      if (error) throw error;
      // Add compatibility wrapper for existing page expectations
      return (data || []).map((exercise: any) => ({
        ...exercise,
        translations: exercise.translations || {}
      }));
    },
  });
};

export const useAddExerciseToWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (exercise: any) => {
      const { data, error } = await supabase
        .from("workout_exercises")
        .insert(exercise)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workout_detail_v4"] }),
  });
};

export const useAddSet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      workoutExerciseId: string; 
      payload: {
        // Bilateral fields
        reps?: number;
        weight?: number;
        
        // Unilateral fields
        left_weight?: number;
        left_reps?: number;
        right_weight?: number;
        right_reps?: number;
        is_alternating?: boolean;
        side?: string;
        side_pair_key?: string;
        side_order?: number;
        
        // Common fields
        rpe?: number;
        notes?: string;
        had_pain?: boolean;
      };
    }) => {
      console.log('🔥 ADD SET START:', params);
      const { workoutExerciseId, payload } = params;
      
      // Ensure auth; also ensures the Supabase client sends the JWT (auth.uid() available)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('🔥 AUTH ERROR:', authError);
        throw new Error("Authentication required");
      }
      
      console.log('🔥 User authenticated:', user.id);

      // Get next set index manually (reliable fallback)
      const { data: existingSets } = await supabase
        .from("workout_sets")
        .select("set_index")
        .eq("workout_exercise_id", workoutExerciseId)
        .order("set_index", { ascending: false })
        .limit(1);
      
      const nextIndex = existingSets?.length ? existingSets[0].set_index + 1 : 1;
      console.log('🔥 Next set index:', nextIndex);

      const insertData = {
        workout_exercise_id: workoutExerciseId,
        set_index: nextIndex,
        
        // Bilateral fields
        reps: payload.reps ?? null,
        weight: payload.weight ?? null,
        
        // Unilateral fields
        left_weight: payload.left_weight ?? null,
        left_reps: payload.left_reps ?? null,
        right_weight: payload.right_weight ?? null,
        right_reps: payload.right_reps ?? null,
        is_alternating: payload.is_alternating ?? null,
        side: payload.side ?? 'n/a',
        side_pair_key: payload.side_pair_key ?? null,
        side_order: payload.side_order ?? null,
        
        // Common fields
        rpe: payload.rpe ?? null,
        notes: payload.notes ?? null,
        had_pain: payload.had_pain ?? false,
      };
      
      console.log('🔥 Inserting data:', insertData);
      console.log('🔥🔥🔥 EXACT SQL QUERY THAT WILL BE EXECUTED:');
      console.log(`INSERT INTO public.workout_sets (workout_exercise_id, set_index, reps, weight, rpe, notes, had_pain) VALUES ('${insertData.workout_exercise_id}', ${insertData.set_index}, ${insertData.reps}, ${insertData.weight}, ${insertData.rpe ? `'${insertData.rpe}'` : 'NULL'}, ${insertData.notes ? `'${insertData.notes}'` : 'NULL'}, ${insertData.had_pain});`);
      console.log('🔥🔥🔥 END EXACT SQL QUERY');

      const { data, error } = await supabase
        .from("workout_sets")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('🔥 INSERT ERROR DETAILS:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('🔥 INSERT SUCCESS:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('🔥 SUCCESS!', data);
      qc.invalidateQueries({ queryKey: ["workout_detail_v4"] });
    },
    onError: (error) => {
      console.error('🔥🔥🔥 MUTATION FAILED:', error);
    }
  });
};

// Personal records
export const usePersonalRecords = () => {
  return useQuery({
    queryKey: ["personal_records"],
    queryFn: async (): Promise<PersonalRecord[]> => {
      const { data, error } = await supabase
        .from("personal_records")
        .select("*")
        .order("achieved_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
};

// Template exercise preferences
export const useTemplateExercisePreferences = (templateExerciseId?: UUID) => {
  return useQuery({
    queryKey: ["template_exercise_preferences", templateExerciseId],
    enabled: !!templateExerciseId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_exercise_preferences")
        .select("*")
        .eq("template_exercise_id", templateExerciseId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertTemplateExercisePreferences = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: any) => {
      const { data, error } = await supabase
        .from("template_exercise_preferences")
        .upsert(preferences)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["template_exercise_preferences"] }),
  });
};