import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type ExperienceLevelType = "new" | "returning" | "intermediate" | "advanced" | "very_experienced";

export interface ExperienceLevelConfig {
  experience_level: ExperienceLevelType;
  start_intensity_low: number;
  start_intensity_high: number;
  warmup_set_count_min: number;
  warmup_set_count_max: number;
  main_rest_seconds_min: number;
  main_rest_seconds_max: number;
  weekly_progress_pct: number;
  allow_high_complexity: boolean;
}

export const useExperienceLevelConfigs = () => {
  return useQuery({
    queryKey: ['experience-level-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experience_level_configs')
        .select('*')
        .order('experience_level');

      if (error) {
        console.error('Error fetching experience level configs:', error);
        throw error;
      }

      return data as ExperienceLevelConfig[];
    }
  });
};

export const useExperienceLevelConfig = (experienceLevel?: ExperienceLevelType) => {
  return useQuery({
    queryKey: ['experience-level-config', experienceLevel],
    queryFn: async () => {
      if (!experienceLevel) return null;

      const { data, error } = await supabase
        .from('experience_level_configs')
        .select('*')
        .eq('experience_level', experienceLevel)
        .single();

      if (error) {
        console.error('Error fetching experience level config:', error);
        throw error;
      }

      return data as ExperienceLevelConfig;
    },
    enabled: !!experienceLevel
  });
};