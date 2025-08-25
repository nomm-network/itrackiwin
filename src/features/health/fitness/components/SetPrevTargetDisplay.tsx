import { Feel, FEEL_OPTIONS } from '../lib/feelToRpe';
import { parseFeelFromNotes, parseFeelFromRPE, suggestTarget } from '../lib/targetSuggestions';
import { useLastSet } from '../hooks/useLastSet';
import { Button } from '@/components/ui/button';

interface SetPrevTargetDisplayProps {
  userId?: string;
  exerciseId?: string;
  setIndex?: number;
  templateTargetReps?: number;
  templateTargetWeight?: number;
  onApplyTarget?: (w: number, r: number) => void;
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
  onApplyTarget,
}: SetPrevTargetDisplayProps) {
  const { data: last, isLoading } = useLastSet(userId, exerciseId, setIndex);

  // Decide the 🎯 target (simple example; plug your smarter logic here)
  const target = (() => {
    if (!last) {
      return {
        weight: templateTargetWeight ?? 0,
        reps: templateTargetReps ?? 10,
        source: 'auto',
      };
    }
    // naive example: if last reps >= template reps, add a small bump
    const shouldBump = (last.reps ?? 0) >= (templateTargetReps ?? 10);
    return {
      weight: (last.weight ?? 0) + (shouldBump ? 2.5 : 0),
      reps: templateTargetReps ?? (last.reps ?? 10),
      source: 'bro',
    };
  })();

  // Optionally push to inputs once (the parent can call setCurrentSetData)
  // useEffect(() => onApplyTarget?.(target.weight, target.reps), [target.weight, target.reps]);

  return (
    <div className="mb-3 rounded-lg border p-3 bg-muted/30">
      {isLoading ? (
        <div>Loading…</div>
      ) : (
        <>
          <div className="flex items-center gap-2 text-sm">
            <span>📜</span>
            {!last ? (
              <span>No previous data</span>
            ) : (
              <span>
                Prev&nbsp;
                <strong>
                  {(last.weight ?? 0).toFixed(0)}kg × {last.reps ?? 0}
                </strong>
                &nbsp;on&nbsp;
                {new Date(last.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span>🎯</span>
            <span>
              Target&nbsp;
              <strong>
                {target.weight.toFixed(0)}kg × {target.reps}
              </strong>
              &nbsp;<span className="text-muted-foreground">({target.source})</span>
            </span>
            {onApplyTarget && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs h-auto py-1 px-2"
                onClick={() => {
                  if (last) onApplyTarget(last.weight ?? 0, last.reps ?? 0);
                }}
              >
                Use Previous ({(last?.weight ?? 0).toFixed(0)}kg × {last?.reps ?? 0})
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}