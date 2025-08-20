import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

// Get metric definitions by exercise ID
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

// Get metric definitions by equipment ID
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

// Get metrics for a specific exercise considering both exercise-specific and equipment-based metrics
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

      // Build OR condition for exercise_id or equipment_id
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

// Get workout set metric values for a set
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

// Upsert workout set metric values
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
      
      // Delete existing metrics for this set
      await supabase
        .from("workout_set_metric_values")
        .delete()
        .eq("workout_set_id", workoutSetId);
      
      // Insert new metric values
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