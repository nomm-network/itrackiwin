import { useLastSet } from './useLastSet';

interface UseGripAwareLastSetProps {
  userId?: string;
  exerciseId?: string;
  setIndex?: number;
  gripIds?: string[] | null;
}

export function useGripAwareLastSet({
  userId,
  exerciseId,
  setIndex,
  gripIds
}: UseGripAwareLastSetProps) {
  // Convert grip_ids array to grip_key (sorted comma-separated string)
  const gripKey = gripIds && gripIds.length > 0 
    ? gripIds.slice().sort().join(',') 
    : null;

  // First try with specific grip combination
  const { data: gripSpecificLastSet, isLoading: isLoadingGripSpecific } = useLastSet(
    userId, 
    exerciseId, 
    setIndex, 
    gripKey
  );

  // Fallback to generic (no grip filter) if no grip-specific history
  const { data: genericLastSet, isLoading: isLoadingGeneric } = useLastSet(
    userId, 
    exerciseId, 
    setIndex, 
    undefined // No grip filter for fallback
  );

  // Use grip-specific if available, otherwise fallback to generic
  const lastSet = gripSpecificLastSet || genericLastSet;
  const isLoading = isLoadingGripSpecific || isLoadingGeneric;

  console.log('🔄 useGripAwareLastSet:', {
    gripIds,
    gripKey,
    hasGripSpecific: !!gripSpecificLastSet,
    hasGeneric: !!genericLastSet,
    usingFallback: !gripSpecificLastSet && !!genericLastSet
  });

  return {
    data: lastSet,
    isLoading,
    isUsingFallback: !gripSpecificLastSet && !!genericLastSet
  };
}