import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBodyweight = () => {
  const [bodyweight, setBodyweight] = useState<number | null>(null);
  
  const fetchBodyweight = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) return null;

      // Get latest weight from user_body_metrics table
      const { data, error } = await supabase
        .from('user_body_metrics')
        .select('weight_kg')
        .eq('user_id', user.user.id)
        .not('weight_kg', 'is', null)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        // No body metrics found
        setBodyweight(null);
        return null;
      }
      
      const latestWeight = data?.weight_kg || null;
      setBodyweight(latestWeight);
      return latestWeight;
    } catch (error) {
      console.error('Error fetching bodyweight:', error);
      return null;
    }
  }, []);

  const recordBodyweight = useCallback(async (weightKg: number, notes?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.id) throw new Error('User not authenticated');

      // Get the latest height to preserve it
      const { data: latestMetrics } = await supabase
        .from('user_body_metrics')
        .select('height_cm')
        .eq('user_id', user.user.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { error } = await supabase
        .from('user_body_metrics')
        .insert({
          user_id: user.user.id,
          weight_kg: weightKg,
          height_cm: latestMetrics?.height_cm || null, // Preserve existing height
          source: 'manual',
          notes: notes || null
        });

      if (error) throw error;
      setBodyweight(weightKg);
      return weightKg;
    } catch (error) {
      console.error('Error recording bodyweight:', error);
      throw error;
    }
  }, []);

  return { bodyweight, fetchBodyweight, recordBodyweight };
};