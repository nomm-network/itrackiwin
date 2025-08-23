import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface RecalibrationRequest {
  userId?: string;
  dryRun?: boolean;
  batchMode?: boolean;
}

export interface RecalibrationResult {
  templateId: string;
  exerciseId: string;
  action: 'increase_load' | 'increase_reps' | 'deload' | 'rebalance_volume' | 'no_change';
  oldValue: number;
  newValue: number;
  reason: string;
  confidence: number;
}

export interface RecalibrationSummary {
  userId: string;
  results: RecalibrationResult[];
  muscleVolumeChanges: Record<string, { old: number; new: number; reason: string }>;
  totalChanges: number;
  dryRun: boolean;
  timestamp: string;
}

export const useRecalibration = () => {
  return useMutation({
    mutationFn: async (request: RecalibrationRequest): Promise<RecalibrationSummary> => {
      const { data, error } = await supabase.functions.invoke('recalibrate-user-plans', {
        body: request
      });

      if (error) {
        console.error('Recalibration error:', error);
        throw new Error(error.message || 'Failed to run recalibration');
      }

      return data;
    },
    onSuccess: (data) => {
      const { totalChanges, dryRun } = data;
      if (dryRun) {
        toast.success(`Dry run complete: ${totalChanges} potential adjustments identified`);
      } else {
        toast.success(`Recalibration complete: ${totalChanges} adjustments applied`);
      }
    },
    onError: (error) => {
      console.error('Recalibration failed:', error);
      toast.error(`Recalibration failed: ${error.message}`);
    }
  });
};

export const useRecalibrationHistory = (userId: string) => {
  return useQuery({
    queryKey: ['recalibration-history', userId],
    queryFn: async () => {
      // This would fetch historical recalibration data
      // For now, return empty array as we don't have a history table
      return [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};