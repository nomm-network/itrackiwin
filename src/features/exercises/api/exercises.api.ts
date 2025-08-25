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
      .from('exercises')
      .select(`
        *,
        primary_muscle:muscles(name),
        equipment(name),
        exercises_translations!inner(name, description)
      `)
      .eq('exercises_translations.language_code', language);

    if (filters?.search) {
      query = query.ilike('exercises_translations.name', `%${filters.search}%`);
    }
    if (filters?.muscleId) {
      query = query.eq('primary_muscle_id', filters.muscleId);
    }
    if (filters?.equipmentId) {
      query = query.eq('equipment_id', filters.equipmentId);
    }

    const { data, error } = await query.order('exercises_translations.name');
    if (error) throw error;
    return data;
  },

  async getExercise(exerciseId: string, language: string = 'en') {
    const { data, error } = await supabase
      .from('exercises')
      .select(`
        *,
        primary_muscle:muscles(name),
        equipment(name),
        exercises_translations!inner(name, description),
        exercise_default_grips(
          grip:grips(*)
        )
      `)
      .eq('id', exerciseId)
      .eq('exercises_translations.language_code', language)
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