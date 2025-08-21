import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Exercise = Database['public']['Tables']['exercises']['Row'];
type Workout = Database['public']['Tables']['workouts']['Row'];
type WorkoutSet = Database['public']['Tables']['workout_sets']['Row'];

// React Query cache keys
export const fitnessKeys = {
  all: ['fitness'] as const,
  workouts: () => [...fitnessKeys.all, 'workouts'] as const,
  workout: (id: string) => [...fitnessKeys.workouts(), id] as const,
  exercises: () => [...fitnessKeys.all, 'exercises'] as const,
  exercise: (id: string) => [...fitnessKeys.exercises(), id] as const,
  metrics: () => [...fitnessKeys.all, 'metrics'] as const,
  metric: (id: string) => [...fitnessKeys.metrics(), id] as const,
  templates: () => [...fitnessKeys.all, 'templates'] as const,
  template: (id: string) => [...fitnessKeys.templates(), id] as const,
};

// Exercises API
export async function fetchExercises(params: { search?: string; muscleId?: string; equipmentId?: string } = {}) {
  let query = supabase
    .from("exercises")
    .select("id, name, primary_muscle_id, equipment_id, image_url, instructions, secondary_muscles")
    .limit(50);

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }
  
  if (params.muscleId) {
    query = query.eq("primary_muscle_id", params.muscleId);
  }
  
  if (params.equipmentId) {
    query = query.eq("equipment_id", params.equipmentId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchExercise(id: string) {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();
    
  if (error) throw error;
  return data;
}

// Workouts API
export async function fetchWorkouts(userId: string) {
  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  return data;
}

export async function fetchWorkout(id: string) {
  const { data, error } = await supabase
    .from("workouts")
    .select("*, workout_sets(*)")
    .eq("id", id)
    .single();
    
  if (error) throw error;
  return data;
}

export async function createWorkout(workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from("workouts")
    .insert(workout)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateWorkout(id: string, updates: Partial<Workout>) {
  const { data, error } = await supabase
    .from("workouts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Workout Sets API
export async function createWorkoutSet(workoutSet: Omit<WorkoutSet, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from("workout_sets")
    .insert(workoutSet)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateWorkoutSet(id: string, updates: Partial<WorkoutSet>) {
  const { data, error } = await supabase
    .from("workout_sets")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}