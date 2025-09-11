import { useState, useEffect, useCallback } from 'react';
import { getEffectivePlateProfile, getCurrentGymContext } from '@/lib/loadout/getProfile';
import { resolveLoadout, type LoadType, type ResolveResult } from '@/lib/loadout/resolveLoadout';

interface UseLoadoutResolverProps {
  equipmentId?: string;
  loadType: LoadType;
  enabled?: boolean;
}

export function useLoadoutResolver({ equipmentId, loadType, enabled = true }: UseLoadoutResolverProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveWeight = useCallback(async (targetWeight: number): Promise<ResolveResult | null> => {
    if (!enabled || loadType === 'bodyweight' || loadType === 'band') {
      return {
        targetDisplay: targetWeight,
        totalSystemWeight: targetWeight,
        matchQuality: 'exact' as const
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      const { gymId, userUnit } = await getCurrentGymContext();
      const profile = await getEffectivePlateProfile(gymId, equipmentId);

      if (!profile) {
        throw new Error('No equipment profile available');
      }

      const result = resolveLoadout({
        desired: targetWeight,
        userUnit,
        loadType,
        profile
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resolve loadout';
      setError(errorMessage);
      console.error('Error resolving loadout:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [equipmentId, loadType, enabled]);

  return {
    resolveWeight,
    isLoading,
    error
  };
}

// Hook for continuous weight resolution (for live updates)
export function useLoadoutLive(targetWeight: number, equipmentId?: string, loadType: LoadType = 'dual_load') {
  const [result, setResult] = useState<ResolveResult | null>(null);
  const { resolveWeight, isLoading, error } = useLoadoutResolver({ equipmentId, loadType });

  useEffect(() => {
    let alive = true;

    resolveWeight(targetWeight).then(resolved => {
      if (alive && resolved) {
        setResult(resolved);
      }
    });

    return () => { alive = false; };
  }, [targetWeight, resolveWeight]);

  return {
    result,
    isLoading,
    error
  };
}