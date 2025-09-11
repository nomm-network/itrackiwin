import { useState, useEffect } from 'react';
import { getActiveWeightModel, WeightModel } from '@/lib/equipment/gymWeightModel';
import { proposeTargetKg, TargetProposal } from '@/lib/training/readinessTargeting';
import { useReadinessData } from '@/hooks/useReadinessData';

interface UseEnhancedTargetingParams {
  userId?: string;
  lastWeightKg?: number;
  templateWeightKg?: number;
  barType?: string;
  progressionMode?: 'progress_weight' | 'progress_reps' | 'maintain';
}

interface EnhancedTargetingResult {
  proposal: TargetProposal | null;
  isLoading: boolean;
  error: string | null;
  weightModel: WeightModel | null;
}

export function useEnhancedTargeting(params: UseEnhancedTargetingParams): EnhancedTargetingResult {
  const [weightModel, setWeightModel] = useState<WeightModel | null>(null);
  const [proposal, setProposal] = useState<TargetProposal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const readiness = useReadinessData();
  
  // Load weight model when user changes
  useEffect(() => {
    if (!params.userId) return;
    
    setIsLoading(true);
    getActiveWeightModel(params.userId)
      .then(setWeightModel)
      .catch(err => {
        console.error('Failed to load weight model:', err);
        setError('Failed to load gym equipment model');
      })
      .finally(() => setIsLoading(false));
  }, [params.userId]);
  
  // Calculate proposal when inputs change
  useEffect(() => {
    if (!weightModel || readiness?.score === null || readiness?.score === undefined) {
      setProposal(null);
      return;
    }
    
    try {
      const newProposal = proposeTargetKg(
        params.lastWeightKg,
        params.templateWeightKg,
        readiness.score,
        weightModel,
        params.barType || 'barbell',
        params.progressionMode || 'progress_weight'
      );
      
      setProposal(newProposal);
      setError(null);
    } catch (err) {
      console.error('Error calculating target proposal:', err);
      setError('Failed to calculate target weight');
      setProposal(null);
    }
  }, [
    weightModel, 
    readiness?.score, 
    params.lastWeightKg, 
    params.templateWeightKg, 
    params.barType, 
    params.progressionMode
  ]);
  
  return {
    proposal,
    isLoading,
    error,
    weightModel
  };
}

/**
 * Debug hook to inspect targeting calculations in development
 */
export function useTargetingDebug(enabled: boolean = false) {
  const [debugData, setDebugData] = useState<any>(null);
  
  useEffect(() => {
    if (!enabled) {
      setDebugData(null);
      return;
    }
    
    // This would be populated by the targeting system for debugging
    setDebugData({
      timestamp: new Date().toISOString(),
      enabled: true
    });
  }, [enabled]);
  
  return debugData;
}