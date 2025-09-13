// React hook wrapper for Targets V3
import { useQuery } from '@tanstack/react-query';
import { computeTargetUnified, type ComputeTargetV3Input, type ComputeTargetV3Result } from './index';

export interface UseTargetsV3Props extends ComputeTargetV3Input {
  enabled?: boolean;
}

export function useTargetsV3(props: UseTargetsV3Props) {
  const { enabled = true, ...input } = props;

  return useQuery<ComputeTargetV3Result>({
    queryKey: [
      'targets-v3',
      input.equipment.exerciseId,
      input.last.prevWeightKg,
      input.last.prevReps,
      input.last.prevFeel,
      input.readiness.todayScore0to100,
      input.readiness.lastScore0to100,
      input.equipment.loadType,
      input.equipment.entryMode,
      input.equipment.gymId,
      input.intent?.targetRepGoal,
    ],
    queryFn: () => computeTargetUnified(input),
    enabled: enabled && !!input.equipment.exerciseId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}