import { supabase } from "@/integrations/supabase/client";

export const exercisesApi = {
  async getExercises(filters?: {
    search?: string;
    muscleId?: string;
    equipmentId?: string;
    language?: string;
  }) {
    const language = filters?.language || 'en';
    
    let query = supabase
      .from('v_exercises_with_translations')
      .select('*');

    if (filters?.search) {
      // Search in translations data
      query = query.or(`translations->>en->>name.ilike.%${filters.search}%,translations->>ro->>name.ilike.%${filters.search}%`);
    }
    if (filters?.muscleId) {
      query = query.eq('primary_muscle_id', filters.muscleId);
    }
    if (filters?.equipmentId) {
      query = query.eq('equipment_id', filters.equipmentId);
    }

    const { data, error } = await query.order('popularity_rank', { ascending: false, nullsFirst: false });
    if (error) throw error;
    return data;
  },

  async getExercise(exerciseId: string, language: string = 'en') {
    const { data, error } = await supabase
      .from('v_exercises_with_translations')
      .select('*')
      .eq('id', exerciseId)
      .single();

    if (error) throw error;
    return data;
  },

  async getEffectiveMuscles(
    exerciseId: string,
    gripIds?: string[],
    equipmentId?: string
  ) {
    const { data, error } = await supabase.rpc('get_effective_muscles', {
      _exercise_id: exerciseId,
      _grip_ids: gripIds || null,
      _equipment_id: equipmentId || null
    });

    if (error) throw error;
    return data || [];
  }
};