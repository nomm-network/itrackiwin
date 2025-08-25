import { Feel, FEEL_OPTIONS } from '../lib/feelToRpe';
import { parseFeelFromNotes, parseFeelFromRPE, suggestTarget } from '../lib/targetSuggestions';
import { useLastSet } from '../hooks/useLastSet';
import { Button } from '@/components/ui/button';

interface SetPrevTargetDisplayProps {
  userId?: string;
  exerciseId?: string;
  setIndex: number;
  templateTargetReps?: number;
  templateTargetWeight?: number;
  onUsePrevious?: (weight: number, reps: number) => void;
}

function FeelBadge({ feel }: { feel?: Feel }) {
  if (!feel) return null;
  
  const feelOption = FEEL_OPTIONS.find(opt => opt.value === feel);
  if (!feelOption) return null;

  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs bg-muted">
      <span className="mr-1">{feelOption.emoji}</span>
      <span>{feel}</span>
    </span>
  );
}

export function SetPrevTargetDisplay({
  userId,
  exerciseId,
  setIndex,
  templateTargetReps,
  templateTargetWeight,
  onUsePrevious
}: SetPrevTargetDisplayProps) {
  const { data: lastSet, isLoading, error } = useLastSet(userId, exerciseId, setIndex);
  
  // Debug log with more detail
  console.log('🎯 SetPrevTargetDisplay DEBUG:', { 
    userId, 
    exerciseId, 
    setIndex, 
    lastSet, 
    isLoading, 
    error,
    templateTargetReps,
    templateTargetWeight,
    userIdValid: !!userId,
    exerciseIdValid: !!exerciseId,
    setIndexValid: Number.isFinite(setIndex)
  });

  if (isLoading) {
    return (
      <div className="mb-3 rounded-md border bg-card/50 px-3 py-2 text-sm animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-muted rounded w-1/3"></div>
      </div>
    );
  }

  // Parse feel from last set
  const lastFeel = lastSet ? 
    parseFeelFromNotes(lastSet.notes) || parseFeelFromRPE(lastSet.rpe) : 
    undefined;

  // Calculate target suggestion
  const target = suggestTarget({
    lastWeight: lastSet?.weight,
    lastReps: lastSet?.reps,
    feel: lastFeel,
    templateTargetReps,
    templateTargetWeight,
    stepKg: 2.5 // TODO: Get from gym equipment config
  });

  return (
    <div className="mb-3 rounded-md border bg-card/50 px-3 py-2 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="opacity-70">📜 Prev</span>
          {lastSet ? (
            <>
              <span className="tabular-nums font-medium">
                {Number(lastSet.weight ?? 0)}kg × {lastSet.reps}
              </span>
              <FeelBadge feel={lastFeel} />
            </>
          ) : (
            <span className="opacity-70">No previous data</span>
          )}
        </div>
        {lastSet && onUsePrevious && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-auto p-1"
            onClick={() => onUsePrevious(
              Number(lastSet.weight ?? 0),
              Number(lastSet.reps ?? 0)
            )}
          >
            Use previous
          </Button>
        )}
      </div>

      <div className="mt-1 flex items-center gap-2">
        <span className="opacity-70">🎯 Target</span>
        <span className="tabular-nums font-medium">
          {Number(target.weight ?? 0)}kg × {Number(target.reps ?? 0)}
        </span>
        <span className="text-xs opacity-70">(auto)</span>
        {target.weight > 0 && target.reps > 0 && onUsePrevious && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs h-auto p-1 ml-auto"
            onClick={() => onUsePrevious(
              Number(target.weight),
              Number(target.reps)
            )}
          >
            Use target
          </Button>
        )}
      </div>
    </div>
  );
}