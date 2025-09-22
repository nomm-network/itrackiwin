import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Equipment {
  id: string;
  slug: string;
  equipment_type: string;
  notes?: string;
}

// Hook to fetch home-suitable equipment from the database
export const useHomeEquipment = () => {
  return useQuery({
    queryKey: ['home-equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, slug, equipment_type, notes')
        .in('slug', [
          'bodyweight',
          'dumbbell', 
          'olympic-barbell',
          'kettlebell',
          'resistance-band',
          'pull-up-bar',
          'bench',
          'squat-rack',
          'cable-machine'
        ])
        .order('slug');

      if (error) throw error;
      return data as Equipment[];
    }
  });
};

// Equipment mapping for display
export const EQUIPMENT_DISPLAY_MAP = {
  'bodyweight': { label: 'Bodyweight', icon: '🤸' },
  'dumbbell': { label: 'Dumbbells', icon: '🏋️' },
  'olympic-barbell': { label: 'Barbell', icon: '🏋️‍♂️' },
  'kettlebell': { label: 'Kettlebells', icon: '⚖️' },
  'resistance-band': { label: 'Resistance Bands', icon: '🔗' },
  'pull-up-bar': { label: 'Pull-up Bar', icon: '🚪' },
  'bench': { label: 'Bench', icon: '🪑' },
  'squat-rack': { label: 'Squat Rack', icon: '🏗️' },
  'cable-machine': { label: 'Cable Machine', icon: '🔌' }
} as const;