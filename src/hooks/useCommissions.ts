import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AmbassadorStatement {
  agreement_id: string;
  ambassador_id: string;
  gym_id: string;
  gym_name: string;
  battle_id: string;
  tier: string;
  percent: number;
  year: number;
  month: number;
  gross_revenue: number;
  commission_due: number;
  starts_at: string;
  ends_at: string | null;
  in_window: boolean;
}

export interface StatementSummary {
  ambassador_id: string;
  year: number;
  month: number;
  commission_total: number;
}

export function useAmbassadorStatements(year?: number, month?: number) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['ambassador-statements', user?.id, year, month],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('v_ambassador_statements')
        .select('*');

      if (year && month) {
        query = query.eq('year', year).eq('month', month);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AmbassadorStatement[];
    },
    enabled: !!user?.id,
    staleTime: 300000, // 5 minutes
  });
}

export function useAmbassadorStatementSummary() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['ambassador-statement-summary', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('v_ambassador_statement_month')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;
      return data as StatementSummary[];
    },
    enabled: !!user?.id,
    staleTime: 300000, // 5 minutes
  });
}

export async function exportCommissionsCSV(year: number, month: number): Promise<string> {
  const { data, error } = await supabase.rpc('export_my_commissions_csv', {
    p_year: year,
    p_month: month
  });

  if (error) throw error;
  return data;
}

export async function exportPayoutsCSV(year: number, month: number): Promise<string> {
  const { data, error } = await supabase.rpc('export_payouts_csv', {
    p_year: year,
    p_month: month
  });

  if (error) throw error;
  return data;
}

// Utility function to download CSV
export function downloadCSV(csvData: string, filename: string) {
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}