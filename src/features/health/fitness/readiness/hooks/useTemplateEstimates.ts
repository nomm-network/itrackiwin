import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Row = { exercise_id: string; exercise_name: string; est_10rm_kg: number | null };

export function useTemplateEstimates(templateId?: string) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;
    (async () => {
      setLoading(true); setError(null);
      try {
        const { data, error } = await supabase.from('template_exercises')
          .select(`
            exercise_id,
            exercises!inner(display_name)
          `)
          .eq('template_id', templateId);
        
        if (error) throw error;
        
        const formattedRows: Row[] = (data || []).map(item => ({
          exercise_id: item.exercise_id,
          exercise_name: (item.exercises as any)?.display_name || 'Unknown Exercise',
          est_10rm_kg: null
        }));
        
        setRows(formattedRows);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    })();
  }, [templateId]);

  return { rows, loading, error };
}

export async function saveEstimates(inputs: Record<string, number>) {
  // For now, just log since the RPC doesn't exist yet
  console.log('Would save estimates:', inputs);
  // TODO: Implement when RPC is available
}